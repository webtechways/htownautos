/**
 * Script to delete all Copart listings from the database
 * Usage: npx ts-node scripts/delete-copart-listings.ts
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n========================================');
  console.log('🗑️  DELETING ALL COPART LISTINGS');
  console.log('========================================\n');

  await prisma.$connect();
  console.log('🔌 Connected to database');

  // Get count before deletion
  const countBefore = await prisma.auctionListing.count();
  console.log(`📊 Records to delete: ${countBefore}\n`);

  if (countBefore === 0) {
    console.log('ℹ️  Table is already empty\n');
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  // Delete all records
  console.log('🗑️  Deleting all records...');
  const result = await prisma.auctionListing.deleteMany({});

  console.log('\n========================================');
  console.log('✅ DELETION COMPLETE');
  console.log('========================================');
  console.log(`🗑️  Deleted: ${result.count} records`);
  console.log('✅ Table copart_listings is now empty');
  console.log('========================================\n');

  await prisma.$disconnect();
  await pool.end();
  console.log('🔌 Disconnected from database');
}

main().catch(console.error);
