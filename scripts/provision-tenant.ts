/**
 * Re-run email provisioning for a single tenant (by subdomain or ID).
 * Directly uses Postmark + Cloudflare APIs without booting Nest.
 *
 * Usage: npx tsx scripts/provision-tenant.ts <subdomain-or-id>
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
const CF_TOKEN = process.env.CLOUDFLARE_SUBDOMAIN_EMAIL_VERIFY || '';
const CF_ZONE = (process.env.CLOUDFLARE_ZONE_ID || '').split(/\s+/)[0];
const CF_API = 'https://api.cloudflare.com/client/v4';

if (!ACCOUNT_TOKEN || !WEBHOOK_USER || !WEBHOOK_PASS || !CF_TOKEN || !CF_ZONE) {
  throw new Error('Missing required env vars (POSTMARK_*, CLOUDFLARE_*)');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const account = new AccountClient(ACCOUNT_TOKEN);

async function cf(method: string, path: string, body?: unknown): Promise<any> {
  const res = await fetch(`${CF_API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json: any = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json.errors?.map((e: any) => `${e.code}: ${e.message}`).join('; ') || res.statusText;
    throw new Error(`Cloudflare ${method} ${path} failed: ${msg}`);
  }
  return json;
}

function stripTrailingDot(v: string) { return v.endsWith('.') ? v.slice(0, -1) : v; }

function inboundHookUrl(): string {
  return `${API_BASE_URL}/api/v1/email/inbound/postmark?token=${encodeURIComponent(WEBHOOK_PASS)}`;
}

async function upsertDns(name: string, type: 'TXT' | 'CNAME' | 'MX', body: any): Promise<string> {
  const list = await cf('GET', `/zones/${CF_ZONE}/dns_records?name=${encodeURIComponent(name)}&type=${type}`);
  const match = list.result?.[0];
  if (match) {
    console.log(`  ↺ Adopted existing ${type} ${name} (id=${match.id})`);
    return match.id;
  }
  const created = await cf('POST', `/zones/${CF_ZONE}/dns_records`, { type, name, ...body });
  console.log(`  + Created ${type} ${name} (id=${created.result.id})`);
  return created.result.id;
}

async function findDomain(name: string): Promise<any | null> {
  const lower = name.toLowerCase();
  let offset = 0;
  for (let i = 0; i < 20; i++) {
    const page: any = await account.getDomains({ count: 50, offset } as any);
    const hit = page.Domains?.find((d: any) => d.Name?.toLowerCase() === lower);
    if (hit) return account.getDomain(hit.ID);
    if (!page.Domains || page.Domains.length < 50) return null;
    offset += 50;
  }
  return null;
}

async function provision(identifier: string) {
  const tenant = await prisma.tenant.findFirst({
    where: { OR: [{ id: identifier }, { subdomain: identifier }] },
  });
  if (!tenant) throw new Error(`Tenant "${identifier}" not found`);
  if (!tenant.subdomain) throw new Error(`Tenant has no subdomain`);

  const domainName = `${tenant.subdomain}.${EMAIL_DOMAIN}`;
  console.log(`\nProvisioning ${tenant.name} (${domainName})\n`);

  // 1. Domain (adopt or create)
  let domainInfo: any = null;
  if (tenant.postmarkDomainId) {
    domainInfo = await account.getDomain(tenant.postmarkDomainId);
    console.log(`  ↺ Using existing domain ${domainInfo.ID}`);
  } else {
    const existing = await findDomain(domainName).catch(() => null);
    if (existing) {
      domainInfo = existing;
      console.log(`  ↺ Adopted existing Postmark domain ${existing.ID}`);
    } else {
      domainInfo = await account.createDomain({ Name: domainName, ReturnPathDomain: `pm-bounces.${domainName}` });
      console.log(`  + Created Postmark domain ${domainInfo.ID}`);
    }
  }

  // 2. DNS
  const recordIds: string[] = [];
  recordIds.push(
    await upsertDns(stripTrailingDot(domainInfo.DKIMPendingHost || domainInfo.DKIMHost), 'TXT', {
      content: domainInfo.DKIMPendingTextValue || domainInfo.DKIMTextValue,
      ttl: 300,
    }),
  );
  recordIds.push(
    await upsertDns(stripTrailingDot(domainInfo.ReturnPathDomain), 'CNAME', {
      content: 'pm.mtasv.net',
      ttl: 300,
      proxied: false,
    }),
  );
  recordIds.push(
    await upsertDns(domainName, 'MX', { content: 'inbound.postmarkapp.com', priority: 10, ttl: 300 }),
  );

  // 3. Server (without InboundDomain — added later once MX propagates)
  let serverId = tenant.postmarkServerId;
  let serverToken = tenant.postmarkServerToken;
  if (!serverId || !serverToken) {
    const server: any = await account.createServer({
      Name: tenant.name || tenant.subdomain,
      Color: 'Blue',
      InboundHookUrl: inboundHookUrl(),
      TrackOpens: true,
      TrackLinks: 'HtmlAndText' as any,
      RawEmailEnabled: true,
    } as any);
    serverId = server.ID;
    serverToken = server.ApiTokens?.[0];
    console.log(`  + Created Postmark server ${serverId}`);
  } else {
    console.log(`  ↺ Using existing server ${serverId}`);
  }

  // 4. Outbound webhook
  let webhookId = tenant.postmarkWebhookId;
  if (!webhookId && serverToken) {
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
      console.log(`  + Created webhook ${webhookId}`);
    } catch (e: any) {
      console.warn(`  ! Webhook create failed: ${e?.message}`);
    }
  }

  // 5. Persist
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      postmarkDomainId: domainInfo.ID,
      postmarkServerId: serverId,
      postmarkServerToken: serverToken,
      postmarkWebhookId: webhookId,
      cloudflareDnsRecordIds: recordIds as any,
      emailProvisionedAt: new Date(),
      postmarkDkimVerified: domainInfo.DKIMVerified || false,
      postmarkReturnPathVerified: domainInfo.ReturnPathDomainVerified || false,
    },
  });

  // 6. Try to attach InboundDomain (may fail if MX not yet visible)
  console.log(`\n  Attempting to attach InboundDomain (may fail if MX hasn't propagated yet)...`);
  try {
    await account.editServer(serverId!, {
      InboundDomain: domainName,
      InboundHookUrl: inboundHookUrl(),
    } as any);
    console.log(`  ✓ InboundDomain attached`);
  } catch (e: any) {
    console.warn(`  ! InboundDomain NOT attached yet: ${e?.message}`);
    console.warn(`    Backend will retry automatically on next send.`);
  }

  // 7. Trigger verification
  try {
    const dkim: any = await account.verifyDomainDKIM(domainInfo.ID);
    const rp: any = await account.verifyDomainReturnPath(domainInfo.ID);
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        postmarkDkimVerified: dkim.DKIMVerified || false,
        postmarkReturnPathVerified: rp.ReturnPathDomainVerified || false,
      },
    });
    console.log(`  DKIM verified: ${dkim.DKIMVerified}, ReturnPath verified: ${rp.ReturnPathDomainVerified}`);
  } catch (e: any) {
    console.warn(`  ! Verification probe failed: ${e?.message}`);
  }

  console.log(`\nDone.`);
}

const id = process.argv[2];
if (!id) {
  console.error('Usage: npx tsx scripts/provision-tenant.ts <subdomain-or-id>');
  process.exit(1);
}

provision(id)
  .catch((e) => {
    console.error('Provision failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
