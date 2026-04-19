/**
 * One-off migration: for every tenant that has a Postmark sending domain but
 * no dedicated Postmark server, create one and wire its inbound/webhook config.
 *
 * Also clears the legacy InboundDomain from the shared Htownautos server so
 * it only handles system emails going forward.
 *
 * Usage: npx tsx scripts/migrate-tenants-to-postmark-servers.ts
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AccountClient, ServerClient } from 'postmark';
import * as dotenv from 'dotenv';
dotenv.config();

const ACCOUNT_TOKEN = process.env.POSTMARK_ACCOUNT_API_TOKEN || '';
const WEBHOOK_USER = process.env.POSTMARK_WEBHOOK_USER || '';
const WEBHOOK_PASS = process.env.POSTMARK_WEBHOOK_PASSWORD || '';
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.htownautos.com';
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'htownautos.com';
const LEGACY_SHARED_SERVER_ID = 18950978; // Htownautos server (kept for system emails)

if (!ACCOUNT_TOKEN) throw new Error('POSTMARK_ACCOUNT_API_TOKEN missing');
if (!WEBHOOK_USER || !WEBHOOK_PASS) throw new Error('POSTMARK_WEBHOOK_* missing');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const account = new AccountClient(ACCOUNT_TOKEN);

function inboundHookUrl(): string {
  const [, proto, host] = API_BASE_URL.match(/^(https?:\/\/)(.*)$/) || [];
  const authed = proto
    ? `${proto}${encodeURIComponent(WEBHOOK_USER)}:${encodeURIComponent(WEBHOOK_PASS)}@${host}`
    : API_BASE_URL;
  return `${authed}/api/v1/email/inbound/postmark`;
}

async function migrate() {
  // Clear the legacy server's InboundDomain so individual per-tenant servers can claim it
  try {
    console.log(`Clearing InboundDomain on legacy server ${LEGACY_SHARED_SERVER_ID}...`);
    await account.editServer(LEGACY_SHARED_SERVER_ID, { InboundDomain: '' } as any);
    console.log('  ✓ Cleared');
  } catch (e: any) {
    console.warn('  ! Failed (continuing):', e?.message);
  }

  const pending = await prisma.tenant.findMany({
    where: {
      deletedAt: null,
      subdomain: { not: null },
      postmarkDomainId: { not: null },
      postmarkServerId: null,
    },
    select: { id: true, name: true, subdomain: true },
  });

  if (pending.length === 0) {
    console.log('\nNo tenants need migration.');
    return;
  }

  console.log(`\nFound ${pending.length} tenant(s) to migrate:`);
  for (const t of pending) console.log(`  - ${t.name} (${t.subdomain})`);

  for (const tenant of pending) {
    const inboundDomain = `${tenant.subdomain}.${EMAIL_DOMAIN}`;
    console.log(`\n→ Provisioning server for "${tenant.name}" (inboundDomain=${inboundDomain})`);

    try {
      const server: any = await account.createServer({
        Name: tenant.name || tenant.subdomain!,
        Color: 'Blue',
        InboundDomain: inboundDomain,
        InboundHookUrl: inboundHookUrl(),
        TrackOpens: true,
        TrackLinks: 'HtmlAndText' as any,
        RawEmailEnabled: true,
      } as any);

      const serverToken: string = server.ApiTokens?.[0];
      if (!serverToken) {
        console.error('  ✗ Server created but no API token returned. Skipping webhook.');
      }

      let webhookId: number | null = null;
      if (serverToken) {
        const client = new ServerClient(serverToken);
        try {
          const webhook: any = await client.createWebhook({
            Url: `${API_BASE_URL}/api/v1/email/webhooks/postmark`,
            MessageStream: 'outbound',
            HttpAuth: { Username: WEBHOOK_USER, Password: WEBHOOK_PASS },
            Triggers: {
              Open: { Enabled: true, PostFirstOpenOnly: false },
              Click: { Enabled: true },
              Delivery: { Enabled: true },
              Bounce: { Enabled: true, IncludeContent: false },
              SpamComplaint: { Enabled: true, IncludeContent: false },
              SubscriptionChange: { Enabled: false },
            },
          } as any);
          webhookId = webhook.ID;
        } catch (webhookErr: any) {
          console.warn('  ! Webhook creation failed:', webhookErr?.message);
        }
      }

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          postmarkServerId: server.ID,
          postmarkServerToken: serverToken,
          postmarkWebhookId: webhookId,
          emailProvisionedAt: new Date(),
        },
      });

      console.log(
        `  ✓ Server ${server.ID} created, webhook ${webhookId ?? '(skipped)'}, stored on tenant.`,
      );
    } catch (err: any) {
      console.error(`  ✗ Failed for tenant ${tenant.id}:`, err?.message);
    }
  }

  console.log('\nDone.');
}

migrate()
  .catch((e) => {
    console.error('Migration crashed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
