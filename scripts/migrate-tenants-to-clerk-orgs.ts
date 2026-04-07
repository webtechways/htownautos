/**
 * Migration Script: Custom Tenants → Clerk Organizations
 *
 * This script:
 * 1. Deletes existing Clerk orgs that don't match any tenant
 * 2. Creates a Clerk Organization for each real tenant
 * 3. Creates memberships for active tenant users
 * 4. Updates the tenant.clerk_org_id in the database
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { createClerkClient } from '@clerk/backend';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Only migrate these tenants (real ones)
const TENANTS_TO_MIGRATE = [
  'Personalsx',
  'Personal',
  'Car Htowwn',
];

// Map DB role slugs to Clerk org roles
function mapRoleToClerkRole(roleSlug: string): string {
  switch (roleSlug) {
    case 'owner':
    case 'admin':
    case 'sales_manager':
      return 'org:admin';
    default:
      return 'org:member';
  }
}

async function cleanupExistingOrgs() {
  console.log('\n--- Cleaning up existing Clerk orgs ---');
  const { data: orgs } = await clerk.organizations.getOrganizationList({ limit: 50 });

  for (const org of orgs) {
    // Check if this org is already linked to a tenant via raw SQL
    const linked: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name FROM tenants WHERE clerk_org_id = $1 LIMIT 1`, org.id
    );

    if (linked.length === 0) {
      console.log(`  Deleting unlinked org: ${org.name} (${org.id})`);
      await clerk.organizations.deleteOrganization(org.id);
    } else {
      console.log(`  Keeping linked org: ${org.name} (${org.id}) → tenant ${linked[0].name}`);
    }
  }
}

async function migrateTenants() {
  console.log('\n--- Migrating tenants to Clerk Organizations ---');

  const tenants = await prisma.tenant.findMany({
    where: {
      name: { in: TENANTS_TO_MIGRATE },
      isActive: true,
    },
    include: {
      users: {
        where: { status: 'active' },
        include: {
          user: true,
          role: true,
        },
      },
    },
  });

  console.log(`Found ${tenants.length} tenants to migrate\n`);

  for (const tenant of tenants) {
    // Skip if already migrated (check via raw SQL)
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT clerk_org_id FROM tenants WHERE id = $1 AND clerk_org_id IS NOT NULL`, tenant.id
    );
    if (existing.length > 0) {
      console.log(`⏭  ${tenant.name} already has clerkOrgId: ${existing[0].clerk_org_id}`);
      continue;
    }

    // Find the owner (creator) for Clerk
    const owner = tenant.users.find(tu => tu.role?.slug === 'owner');
    if (!owner) {
      console.log(`⚠  ${tenant.name}: No owner found, skipping`);
      continue;
    }

    // Owner must have a Clerk user ID (starts with 'user_')
    const clerkUserId = owner.user.clerkUserId;
    if (!clerkUserId || !clerkUserId.startsWith('user_')) {
      console.log(`⚠  ${tenant.name}: Owner ${owner.user.email} has no valid Clerk ID (${clerkUserId}), skipping`);
      continue;
    }

    console.log(`\n🏢 Creating org for: ${tenant.name} (slug: ${tenant.slug})`);
    console.log(`   Owner: ${owner.user.email} (${clerkUserId})`);

    // Create the Clerk Organization (without slug — not enabled in this instance)
    const org = await clerk.organizations.createOrganization({
      name: tenant.name,
      createdBy: clerkUserId,
      publicMetadata: {
        tenantId: tenant.id,
        slug: tenant.slug,
        businessName: tenant.businessName || tenant.name,
      },
    });

    console.log(`   ✅ Created org: ${org.id}`);

    // Update tenant with clerk org ID via raw SQL
    await prisma.$queryRawUnsafe(
      `UPDATE tenants SET clerk_org_id = $1 WHERE id = $2`, org.id, tenant.id
    );
    console.log(`   ✅ Updated tenant.clerkOrgId`);

    // Create memberships for other active users (owner is auto-added as admin)
    for (const tu of tenant.users) {
      if (tu.userId === owner.userId) continue; // Owner already added

      const memberClerkId = tu.user.clerkUserId;
      if (!memberClerkId || !memberClerkId.startsWith('user_')) {
        console.log(`   ⚠  Skipping ${tu.user.email}: no valid Clerk ID (${memberClerkId || 'none'})`);
        continue;
      }

      const clerkRole = mapRoleToClerkRole(tu.role?.slug || 'member');
      console.log(`   👤 Adding ${tu.user.email} as ${clerkRole}`);

      try {
        await clerk.organizations.createOrganizationMembership({
          organizationId: org.id,
          userId: memberClerkId,
          role: clerkRole,
        });
        console.log(`      ✅ Added`);
      } catch (err: any) {
        console.log(`      ❌ Failed: ${err.message}`);
      }
    }
  }
}

async function main() {
  try {
    await cleanupExistingOrgs();
    await migrateTenants();

    // Summary
    console.log('\n\n--- Migration Summary ---');
    const migrated: any[] = await prisma.$queryRawUnsafe(
      `SELECT name, clerk_org_id FROM tenants WHERE clerk_org_id IS NOT NULL`
    );
    console.log(`Migrated tenants: ${migrated.length}`);
    migrated.forEach(t => console.log(`  ✅ ${t.name} → ${t.clerk_org_id}`));

    const notMigrated: any[] = await prisma.$queryRawUnsafe(
      `SELECT name FROM tenants WHERE name = ANY($1) AND clerk_org_id IS NULL`,
      TENANTS_TO_MIGRATE
    );
    if (notMigrated.length > 0) {
      console.log(`\nNot migrated: ${notMigrated.length}`);
      notMigrated.forEach(t => console.log(`  ⚠  ${t.name}`));
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
