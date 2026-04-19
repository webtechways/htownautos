/**
 * Reconcile Postmark webhook URLs for every provisioned tenant.
 *
 * Reads API_BASE_URL from .env and updates:
 *   1. InboundHookUrl on each tenant's Postmark server (embedded basic auth)
 *   2. The outbound-events webhook URL + HttpAuth (server-level webhook)
 *
 * Idempotent — safe to re-run whenever the API_BASE_URL or webhook password changes.
 *
 * Usage: npx tsx scripts/reconcile-postmark-webhooks.ts
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
const API_BASE_URL = process.env.API_BASE_URL || '';

if (!ACCOUNT_TOKEN || !WEBHOOK_USER || !WEBHOOK_PASS || !API_BASE_URL) {
  throw new Error('Missing env: POSTMARK_ACCOUNT_API_TOKEN, POSTMARK_WEBHOOK_*, API_BASE_URL');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const account = new AccountClient(ACCOUNT_TOKEN);

function inboundHookUrl(): string {
  // Query-string token (see PostmarkWebhookGuard) instead of embedded basic auth,
  // because Cloudflare Tunnel / nginx strip userinfo from URLs before forwarding.
  return `${API_BASE_URL}/api/v1/email/inbound/postmark?token=${encodeURIComponent(WEBHOOK_PASS)}`;
}

function outboundHookUrl(): string {
  return `${API_BASE_URL}/api/v1/email/webhooks/postmark`;
}

async function reconcile() {
  console.log(`Reconciling webhooks against base: ${API_BASE_URL}\n`);

  const tenants = await prisma.tenant.findMany({
    where: {
      deletedAt: null,
      postmarkServerId: { not: null },
      postmarkServerToken: { not: null },
    },
    select: {
      id: true,
      name: true,
      subdomain: true,
      postmarkServerId: true,
      postmarkServerToken: true,
      postmarkWebhookId: true,
    },
  });

  if (tenants.length === 0) {
    console.log('No provisioned tenants found.');
    return;
  }

  for (const t of tenants) {
    console.log(`→ ${t.name} (${t.subdomain}) — server ${t.postmarkServerId}`);

    // 1. Update server-level InboundHookUrl
    try {
      await account.editServer(t.postmarkServerId!, {
        InboundHookUrl: inboundHookUrl(),
      } as any);
      console.log(`   ✓ Inbound hook updated`);
    } catch (e: any) {
      console.warn(`   ! Failed updating InboundHookUrl: ${e?.message}`);
    }

    // 2. Update or recreate the outbound events webhook
    const serverClient = new ServerClient(t.postmarkServerToken!);
    const desiredTriggers = {
      Open: { Enabled: true, PostFirstOpenOnly: true },
      Click: { Enabled: true },
      Delivery: { Enabled: true },
      Bounce: { Enabled: true, IncludeContent: false },
      SpamComplaint: { Enabled: true, IncludeContent: false },
      SubscriptionChange: { Enabled: false },
    };
    try {
      if (t.postmarkWebhookId) {
        // Attempt a PUT-style edit if supported; fallback to delete+create.
        try {
          await (serverClient as any).editWebhook(t.postmarkWebhookId, {
            Url: outboundHookUrl(),
            HttpAuth: { Username: WEBHOOK_USER, Password: WEBHOOK_PASS },
            Triggers: desiredTriggers,
          });
          console.log(`   ✓ Outbound webhook ${t.postmarkWebhookId} updated`);
          continue;
        } catch {
          // SDK/API doesn't support edit on this version → delete and recreate
          try {
            await (serverClient as any).deleteWebhook(t.postmarkWebhookId);
          } catch (e: any) {
            console.warn(`   ! Failed deleting old webhook: ${e?.message}`);
          }
        }
      }

      const created: any = await serverClient.createWebhook({
        Url: outboundHookUrl(),
        MessageStream: 'outbound',
        HttpAuth: { Username: WEBHOOK_USER, Password: WEBHOOK_PASS },
        Triggers: {
          Open: { Enabled: true, PostFirstOpenOnly: true },
          Click: { Enabled: true },
          Delivery: { Enabled: true },
          Bounce: { Enabled: true, IncludeContent: false },
          SpamComplaint: { Enabled: true, IncludeContent: false },
          SubscriptionChange: { Enabled: false },
        },
      } as any);

      await prisma.tenant.update({
        where: { id: t.id },
        data: { postmarkWebhookId: created.ID },
      });

      console.log(`   ✓ Outbound webhook recreated (id=${created.ID})`);
    } catch (e: any) {
      console.warn(`   ! Failed updating outbound webhook: ${e?.message}`);
    }
  }

  console.log('\nDone.');
}

reconcile()
  .catch((e) => {
    console.error('Reconcile failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
