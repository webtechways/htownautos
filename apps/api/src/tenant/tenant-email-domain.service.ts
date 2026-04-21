import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { Prisma, Tenant } from '@prisma/client';
import { Resolver } from 'node:dns';
import { PostmarkService } from '../postmark/postmark.service';
import { CloudflareDnsService } from '../cloudflare/cloudflare-dns.service';

const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'htownautos.com';
const POSTMARK_INBOUND_HOST = 'inbound.postmarkapp.com';
const POSTMARK_RETURN_PATH_TARGET = 'pm.mtasv.net';

/**
 * Orchestrates email domain provisioning across Postmark + Cloudflare DNS.
 *
 * On provision: creates a Postmark Domain for `<subdomain>.htownautos.com`,
 * then adds DKIM (TXT), Return-Path (CNAME), and Inbound (MX) records in
 * Cloudflare. Triggers verification when DNS is set.
 *
 * On deprovision: deletes the DNS records in Cloudflare, then removes the
 * Postmark Domain. Idempotent — safe to call repeatedly.
 */
@Injectable()
export class TenantEmailDomainService {
  private readonly logger = new Logger(TenantEmailDomainService.name);

  constructor(
    private prisma: PrismaService,
    private postmark: PostmarkService,
    private cloudflare: CloudflareDnsService,
  ) {}

  /**
   * Make sure a tenant's email domain + dedicated Postmark server are provisioned.
   * If already done, no-op (but also re-tries attaching InboundDomain since MX
   * propagation may have completed after the initial provision). Returns the
   * fresh Tenant record.
   */
  async ensureProvisioned(tenantId: string): Promise<Tenant> {
    const tenant = await this.getTenant(tenantId);
    const fullyDone =
      tenant.postmarkDomainId &&
      tenant.postmarkServerId &&
      tenant.postmarkServerToken &&
      tenant.emailProvisionedAt;

    if (!fullyDone) {
      await this.provision(tenantId);
      return this.getTenant(tenantId);
    }

    // Provisioned already; piggy-back an InboundDomain attach attempt in the
    // background in case MX propagation finished since last run. Do not await —
    // sends must not be delayed by this.
    this.tryAttachInboundDomain(tenantId).catch(() => undefined);
    return tenant;
  }

  private webhookBaseUrl(): string {
    // Always use the API base URL of the current environment for webhooks.
    return process.env.API_BASE_URL || 'https://api.htownautos.com';
  }

  private webhookAuth() {
    const username = process.env.POSTMARK_WEBHOOK_USER;
    const password = process.env.POSTMARK_WEBHOOK_PASSWORD;
    if (!username || !password) return undefined;
    return { username, password };
  }

  /**
   * Full provision: create Postmark domain (sending) + Postmark server (per-tenant,
   * for inbound), add DNS records, wire up webhook, trigger verification.
   * Safe to call multiple times — each step is idempotent.
   */
  async provision(tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);

    if (!tenant.subdomain) {
      throw new BadRequestException(`Tenant ${tenantId} has no subdomain; cannot provision email`);
    }

    const domainName = `${tenant.subdomain}.${EMAIL_DOMAIN}`;
    const fullyDone =
      tenant.postmarkDomainId && tenant.postmarkServerId && tenant.postmarkServerToken && tenant.emailProvisionedAt;

    if (fullyDone) {
      this.logger.log(`Tenant ${tenantId} already fully provisioned; re-verifying DKIM/ReturnPath`);
      await this.refreshVerification(tenant.id, tenant.postmarkDomainId!);
      return;
    }

    this.logger.log(`Provisioning email infrastructure for "${domainName}" (tenant ${tenantId})`);

    // Step 1 — Postmark sending domain (account-level, shared across servers).
    // If an earlier provision attempt partially succeeded, the domain may already
    // exist in Postmark even though we didn't persist its ID. Reconcile by name.
    let domainId = tenant.postmarkDomainId;
    let domainInfo = null as Awaited<ReturnType<typeof this.postmark.createDomain>> | null;
    if (!domainId) {
      const existing = await this.postmark.findDomainByName(domainName).catch(() => null);
      if (existing) {
        this.logger.log(`Adopting existing Postmark domain ${existing.id} for ${domainName}`);
        domainInfo = existing;
        domainId = existing.id;
      } else {
        domainInfo = await this.postmark.createDomain(domainName);
        domainId = domainInfo.id;
      }
    }

    // Step 2 — DNS records in Cloudflare (DKIM TXT + Return-Path CNAME + Inbound MX).
    // Adopt existing records by name if we don't have tracked IDs (partial failure recovery).
    const recordIds = this.extractRecordIds(tenant.cloudflareDnsRecordIds);
    try {
      if (recordIds.length === 0) {
        const info = domainInfo || (await this.postmark.getDomain(domainId!));
        const dkimName = this.stripTrailingDot(info.dkimHost);
        const rpName = this.stripTrailingDot(info.returnPathDomain);

        const dkimRecord = await this.upsertDnsRecord(dkimName, 'TXT', () =>
          this.cloudflare.createTxt(dkimName, info.dkimTextValue),
        );
        recordIds.push(dkimRecord.id);

        const rpRecord = await this.upsertDnsRecord(rpName, 'CNAME', () =>
          this.cloudflare.createCname(rpName, POSTMARK_RETURN_PATH_TARGET),
        );
        recordIds.push(rpRecord.id);

        const mxRecord = await this.upsertDnsRecord(domainName, 'MX', () =>
          this.cloudflare.createMx(domainName, POSTMARK_INBOUND_HOST, 10),
        );
        recordIds.push(mxRecord.id);
      }
    } catch (err) {
      // Rollback the fresh domain if DNS failed (leave previously-linked domain alone)
      this.logger.error(`DNS provisioning failed for ${domainName}`, (err as Error)?.stack);
      if (domainInfo && !tenant.postmarkDomainId) {
        await this.postmark.deleteDomain(domainInfo.id).catch((e) =>
          this.logger.error(`Rollback deleteDomain failed: ${(e as Error)?.message}`),
        );
      }
      for (const id of recordIds) {
        await this.cloudflare.deleteRecord(id).catch(() => undefined);
      }
      throw err;
    }

    // Step 3 — Per-tenant Postmark server.
    //
    // IMPORTANT: we create the server WITHOUT `InboundDomain` on purpose. Postmark
    // validates the MX record synchronously at create-time, and we just wrote the MX
    // to Cloudflare — propagation to Postmark's resolvers can take minutes. Attaching
    // the InboundDomain happens later (Step 6 / refreshVerification) with retry logic.
    let postmarkServerId = tenant.postmarkServerId;
    let postmarkServerToken = tenant.postmarkServerToken;
    if (!postmarkServerId || !postmarkServerToken) {
      const serverName = tenant.name || tenant.subdomain;
      try {
        // Reconcile by name first: if a previous provision attempt created the
        // server but failed before persisting its ID/token, Postmark will reject
        // a second createServer with "server name already exists". Adopt it.
        const existing = await this.postmark.findServerByName(serverName).catch(() => null);
        if (existing) {
          postmarkServerId = existing.id;
          postmarkServerToken = existing.apiToken;
          this.logger.log(
            `Adopting existing Postmark server ${existing.id} ("${serverName}") for tenant ${tenantId}`,
          );
        } else {
          const created = await this.postmark.createServer({
            name: serverName,
            color: 'Blue',
            inboundHookUrl: this.buildInboundHookUrl(),
            trackOpens: true,
            trackLinks: 'HtmlAndText',
            rawEmailEnabled: true,
          });
          postmarkServerId = created.id;
          postmarkServerToken = created.apiToken;
          this.logger.log(`Created Postmark server ${created.id} for tenant ${tenantId}`);
        }
      } catch (err) {
        this.logger.error(`Failed to create Postmark server for ${domainName}`, (err as Error)?.stack);
        throw err;
      }
    }

    // Step 4 — Webhook on the tenant's server for outbound events
    let webhookId = tenant.postmarkWebhookId;
    if (!webhookId && postmarkServerToken) {
      try {
        const webhook = await this.postmark.createOutboundWebhook(postmarkServerToken, {
          url: `${this.webhookBaseUrl()}/api/v1/email/webhooks/postmark`,
          basicAuth: this.webhookAuth(),
        });
        webhookId = webhook.id;
        this.logger.log(`Created outbound webhook ${webhook.id} on server ${postmarkServerId}`);
      } catch (err) {
        // Non-fatal: webhook can be retried later; other functionality still works.
        this.logger.warn(`Failed to create outbound webhook: ${(err as Error)?.message}`);
      }
    }

    // Step 5 — Persist everything
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        postmarkDomainId: domainId,
        postmarkServerId,
        postmarkServerToken,
        postmarkWebhookId: webhookId,
        cloudflareDnsRecordIds: recordIds as unknown as Prisma.InputJsonValue,
        emailProvisionedAt: new Date(),
        postmarkDkimVerified: domainInfo?.dkimVerified ?? tenant.postmarkDkimVerified,
        postmarkReturnPathVerified: domainInfo?.returnPathVerified ?? tenant.postmarkReturnPathVerified,
      },
    });

    // Step 6 — Wait for DNS propagation (actively, not a blind sleep), then
    //            trigger verification and attach the InboundDomain.
    await this.waitForMxPropagation(domainName, { maxWaitMs: 20000 });
    await this.refreshVerification(tenantId, domainId!);
    await this.tryAttachInboundDomain(tenantId, { retries: 3 });
  }

  /**
   * Poll public DNS resolvers until the MX record for `domain` points to
   * Postmark's inbound host. Returns true if seen within `maxWaitMs`, false
   * otherwise. Uses Cloudflare (1.1.1.1) and Google (8.8.8.8) — if either
   * resolver sees the record, Postmark's resolvers will too, soon after.
   */
  private async waitForMxPropagation(
    domain: string,
    options: { maxWaitMs: number; pollIntervalMs?: number } = { maxWaitMs: 20000 },
  ): Promise<boolean> {
    const deadline = Date.now() + options.maxWaitMs;
    const interval = options.pollIntervalMs ?? 1500;
    const resolver = new Resolver();
    resolver.setServers(['1.1.1.1', '8.8.8.8']);

    while (Date.now() < deadline) {
      try {
        const records = await new Promise<Array<{ exchange: string; priority: number }>>(
          (resolve, reject) => {
            resolver.resolveMx(domain, (err, recs) => (err ? reject(err) : resolve(recs)));
          },
        );
        const matches = records.some((r) =>
          r.exchange?.toLowerCase().includes(POSTMARK_INBOUND_HOST),
        );
        if (matches) {
          this.logger.log(`MX for ${domain} visible in public DNS`);
          return true;
        }
      } catch {
        // NXDOMAIN / SERVFAIL while propagating — keep polling
      }
      await this.sleep(interval);
    }
    this.logger.warn(`MX for ${domain} still not visible after ${options.maxWaitMs}ms`);
    return false;
  }

  /**
   * Attach InboundDomain to the tenant's Postmark server. Retries with
   * exponential backoff when Postmark reports "no MX record found" (DNS may
   * still be propagating to Postmark's own resolvers). Safe to call repeatedly.
   */
  async tryAttachInboundDomain(
    tenantId: string,
    options: { retries?: number } = {},
  ): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant.subdomain || !tenant.postmarkServerId) return false;

    const domainName = `${tenant.subdomain}.${EMAIL_DOMAIN}`;
    const retries = Math.max(0, options.retries ?? 0);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.postmark.updateServer(tenant.postmarkServerId, {
          inboundDomain: domainName,
          inboundHookUrl: this.buildInboundHookUrl(),
        });
        this.logger.log(
          `Attached InboundDomain "${domainName}" to Postmark server ${tenant.postmarkServerId}` +
            (attempt > 0 ? ` (after ${attempt} retries)` : ''),
        );
        return true;
      } catch (err) {
        const msg = (err as Error)?.message || '';
        const transient = msg.toLowerCase().includes('mx record');
        if (!transient || attempt === retries) {
          if (transient) {
            this.logger.warn(
              `MX for ${domainName} not visible to Postmark yet; giving up this round (${msg})`,
            );
          } else {
            this.logger.warn(`Could not attach InboundDomain for ${domainName}: ${msg}`);
          }
          return false;
        }
        const backoff = 2000 * Math.pow(2, attempt); // 2s, 4s, 8s...
        this.logger.log(
          `MX not visible yet (attempt ${attempt + 1}/${retries + 1}); retrying in ${backoff}ms`,
        );
        await this.sleep(backoff);
      }
    }
    return false;
  }

  private buildInboundHookUrl(): string {
    // Postmark's server-level InboundHookUrl has no HttpAuth field (unlike the
    // Webhooks API used for outbound events). Userinfo embedded in the URL
    // (https://user:pass@host) gets stripped by some proxies (Cloudflare Tunnel,
    // nginx) before reaching the backend, so we pass the shared secret as a
    // query string token instead. The PostmarkWebhookGuard accepts either.
    const auth = this.webhookAuth();
    const base = this.webhookBaseUrl();
    const path = '/api/v1/email/inbound/postmark';
    if (!auth) return `${base}${path}`;
    return `${base}${path}?token=${encodeURIComponent(auth.password)}`;
  }

  /**
   * Re-trigger DKIM + Return-Path verification on Postmark and update tenant flags.
   */
  async refreshVerification(tenantId: string, postmarkDomainId: number): Promise<void> {
    try {
      const dkim = await this.postmark.verifyDkim(postmarkDomainId);
      const returnPath = await this.postmark.verifyReturnPath(postmarkDomainId);
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          postmarkDkimVerified: dkim.dkimVerified,
          postmarkReturnPathVerified: returnPath.returnPathVerified,
        },
      });
      this.logger.log(
        `Verification for tenant ${tenantId}: DKIM=${dkim.dkimVerified}, ReturnPath=${returnPath.returnPathVerified}`,
      );
    } catch (err) {
      this.logger.warn(`Verification probe failed for tenant ${tenantId}: ${(err as Error)?.message}`);
    }
  }

  /**
   * Tear down Postmark domain + Cloudflare DNS. Idempotent. Errors are logged
   * individually so a partial failure doesn't block tenant deletion.
   */
  async deprovision(tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);

    // 1. Delete tracked DNS records
    const ids = this.extractRecordIds(tenant.cloudflareDnsRecordIds);
    for (const id of ids) {
      try {
        await this.cloudflare.deleteRecord(id);
      } catch (err) {
        this.logger.warn(`Failed to delete Cloudflare record ${id}: ${(err as Error)?.message}`);
      }
    }

    // 2. Fallback: delete any leftover records by name pattern (in case IDs got lost)
    if (tenant.subdomain) {
      const domainName = `${tenant.subdomain}.${EMAIL_DOMAIN}`;
      const leftovers = [
        domainName,
        `pm-bounces.${domainName}`,
        // Generic DKIM host pattern; Postmark uses a selector-prefixed subdomain.
        // We strip _domainkey.<sub> children by listing from apex and filtering.
      ];
      for (const name of leftovers) {
        await this.cloudflare.deleteByName(name).catch(() => undefined);
      }
      // Sweep DKIM selector records under the subdomain
      await this.cloudflare.deleteByName(`_domainkey.${domainName}`, 'TXT').catch(() => undefined);
    }

    // 3. Delete the tenant's Postmark server (this also removes its webhooks)
    if (tenant.postmarkServerId) {
      try {
        await this.postmark.deleteServer(tenant.postmarkServerId);
        this.logger.log(`Deleted Postmark server ${tenant.postmarkServerId}`);
      } catch (err) {
        this.logger.warn(
          `Failed to delete Postmark server ${tenant.postmarkServerId}: ${(err as Error)?.message}`,
        );
      }
    }

    // 4. Delete Postmark sending domain
    if (tenant.postmarkDomainId) {
      try {
        await this.postmark.deleteDomain(tenant.postmarkDomainId);
      } catch (err) {
        this.logger.warn(`Failed to delete Postmark domain ${tenant.postmarkDomainId}: ${(err as Error)?.message}`);
      }
    }

    // 5. Clear fields on tenant
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        postmarkDomainId: null,
        postmarkServerId: null,
        postmarkServerToken: null,
        postmarkWebhookId: null,
        postmarkDkimVerified: false,
        postmarkReturnPathVerified: false,
        emailProvisionedAt: null,
        cloudflareDnsRecordIds: Prisma.DbNull,
      },
    });

    this.logger.log(`Deprovisioned email infrastructure for tenant ${tenantId}`);
  }

  private async getTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`);
    return tenant;
  }

  private extractRecordIds(raw: Prisma.JsonValue | null): string[] {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.filter((v): v is string => typeof v === 'string');
  }

  private stripTrailingDot(value: string): string {
    return value.endsWith('.') ? value.slice(0, -1) : value;
  }

  /** Adopt an existing DNS record by name+type if present, otherwise create it. */
  private async upsertDnsRecord(
    name: string,
    type: 'TXT' | 'CNAME' | 'MX',
    createFn: () => Promise<{ id: string }>,
  ): Promise<{ id: string }> {
    try {
      const existing = await this.cloudflare.listByName(name);
      const match = existing.find((r) => r.type === type);
      if (match) {
        this.logger.log(`Adopting existing Cloudflare ${type} record ${match.id} for ${name}`);
        return match;
      }
    } catch (err) {
      this.logger.warn(`listByName for ${name} failed (will create): ${(err as Error)?.message}`);
    }
    return createFn();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
