"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TenantEmailDomainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantEmailDomainService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const client_1 = require("@prisma/client");
const node_dns_1 = require("node:dns");
const postmark_service_1 = require("../postmark/postmark.service");
const cloudflare_dns_service_1 = require("../cloudflare/cloudflare-dns.service");
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'htownautos.com';
const POSTMARK_INBOUND_HOST = 'inbound.postmarkapp.com';
const POSTMARK_RETURN_PATH_TARGET = 'pm.mtasv.net';
let TenantEmailDomainService = TenantEmailDomainService_1 = class TenantEmailDomainService {
    prisma;
    postmark;
    cloudflare;
    logger = new common_1.Logger(TenantEmailDomainService_1.name);
    constructor(prisma, postmark, cloudflare) {
        this.prisma = prisma;
        this.postmark = postmark;
        this.cloudflare = cloudflare;
    }
    async ensureProvisioned(tenantId) {
        const tenant = await this.getTenant(tenantId);
        const fullyDone = tenant.postmarkDomainId &&
            tenant.postmarkServerId &&
            tenant.postmarkServerToken &&
            tenant.emailProvisionedAt;
        if (!fullyDone) {
            await this.provision(tenantId);
            return this.getTenant(tenantId);
        }
        this.tryAttachInboundDomain(tenantId).catch(() => undefined);
        return tenant;
    }
    webhookBaseUrl() {
        return process.env.API_BASE_URL || 'https://api.htownautos.com';
    }
    webhookAuth() {
        const username = process.env.POSTMARK_WEBHOOK_USER;
        const password = process.env.POSTMARK_WEBHOOK_PASSWORD;
        if (!username || !password)
            return undefined;
        return { username, password };
    }
    async provision(tenantId) {
        const tenant = await this.getTenant(tenantId);
        if (!tenant.subdomain) {
            throw new common_1.BadRequestException(`Tenant ${tenantId} has no subdomain; cannot provision email`);
        }
        const domainName = `${tenant.subdomain}.${EMAIL_DOMAIN}`;
        const fullyDone = tenant.postmarkDomainId && tenant.postmarkServerId && tenant.postmarkServerToken && tenant.emailProvisionedAt;
        if (fullyDone) {
            this.logger.log(`Tenant ${tenantId} already fully provisioned; re-verifying DKIM/ReturnPath`);
            await this.refreshVerification(tenant.id, tenant.postmarkDomainId);
            return;
        }
        this.logger.log(`Provisioning email infrastructure for "${domainName}" (tenant ${tenantId})`);
        let domainId = tenant.postmarkDomainId;
        let domainInfo = null;
        if (!domainId) {
            const existing = await this.postmark.findDomainByName(domainName).catch(() => null);
            if (existing) {
                this.logger.log(`Adopting existing Postmark domain ${existing.id} for ${domainName}`);
                domainInfo = existing;
                domainId = existing.id;
            }
            else {
                domainInfo = await this.postmark.createDomain(domainName);
                domainId = domainInfo.id;
            }
        }
        const recordIds = this.extractRecordIds(tenant.cloudflareDnsRecordIds);
        try {
            if (recordIds.length === 0) {
                const info = domainInfo || (await this.postmark.getDomain(domainId));
                const dkimName = this.stripTrailingDot(info.dkimHost);
                const rpName = this.stripTrailingDot(info.returnPathDomain);
                const dkimRecord = await this.upsertDnsRecord(dkimName, 'TXT', () => this.cloudflare.createTxt(dkimName, info.dkimTextValue));
                recordIds.push(dkimRecord.id);
                const rpRecord = await this.upsertDnsRecord(rpName, 'CNAME', () => this.cloudflare.createCname(rpName, POSTMARK_RETURN_PATH_TARGET));
                recordIds.push(rpRecord.id);
                const mxRecord = await this.upsertDnsRecord(domainName, 'MX', () => this.cloudflare.createMx(domainName, POSTMARK_INBOUND_HOST, 10));
                recordIds.push(mxRecord.id);
            }
        }
        catch (err) {
            this.logger.error(`DNS provisioning failed for ${domainName}`, err?.stack);
            if (domainInfo && !tenant.postmarkDomainId) {
                await this.postmark.deleteDomain(domainInfo.id).catch((e) => this.logger.error(`Rollback deleteDomain failed: ${e?.message}`));
            }
            for (const id of recordIds) {
                await this.cloudflare.deleteRecord(id).catch(() => undefined);
            }
            throw err;
        }
        let postmarkServerId = tenant.postmarkServerId;
        let postmarkServerToken = tenant.postmarkServerToken;
        if (!postmarkServerId || !postmarkServerToken) {
            const serverName = tenant.name || tenant.subdomain;
            try {
                const existing = await this.postmark.findServerByName(serverName).catch(() => null);
                if (existing) {
                    postmarkServerId = existing.id;
                    postmarkServerToken = existing.apiToken;
                    this.logger.log(`Adopting existing Postmark server ${existing.id} ("${serverName}") for tenant ${tenantId}`);
                }
                else {
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
            }
            catch (err) {
                this.logger.error(`Failed to create Postmark server for ${domainName}`, err?.stack);
                throw err;
            }
        }
        let webhookId = tenant.postmarkWebhookId;
        if (!webhookId && postmarkServerToken) {
            try {
                const webhook = await this.postmark.createOutboundWebhook(postmarkServerToken, {
                    url: `${this.webhookBaseUrl()}/api/v1/email/webhooks/postmark`,
                    basicAuth: this.webhookAuth(),
                });
                webhookId = webhook.id;
                this.logger.log(`Created outbound webhook ${webhook.id} on server ${postmarkServerId}`);
            }
            catch (err) {
                this.logger.warn(`Failed to create outbound webhook: ${err?.message}`);
            }
        }
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                postmarkDomainId: domainId,
                postmarkServerId,
                postmarkServerToken,
                postmarkWebhookId: webhookId,
                cloudflareDnsRecordIds: recordIds,
                emailProvisionedAt: new Date(),
                postmarkDkimVerified: domainInfo?.dkimVerified ?? tenant.postmarkDkimVerified,
                postmarkReturnPathVerified: domainInfo?.returnPathVerified ?? tenant.postmarkReturnPathVerified,
            },
        });
        await this.waitForMxPropagation(domainName, { maxWaitMs: 20000 });
        await this.refreshVerification(tenantId, domainId);
        await this.tryAttachInboundDomain(tenantId, { retries: 3 });
    }
    async waitForMxPropagation(domain, options = { maxWaitMs: 20000 }) {
        const deadline = Date.now() + options.maxWaitMs;
        const interval = options.pollIntervalMs ?? 1500;
        const resolver = new node_dns_1.Resolver();
        resolver.setServers(['1.1.1.1', '8.8.8.8']);
        while (Date.now() < deadline) {
            try {
                const records = await new Promise((resolve, reject) => {
                    resolver.resolveMx(domain, (err, recs) => (err ? reject(err) : resolve(recs)));
                });
                const matches = records.some((r) => r.exchange?.toLowerCase().includes(POSTMARK_INBOUND_HOST));
                if (matches) {
                    this.logger.log(`MX for ${domain} visible in public DNS`);
                    return true;
                }
            }
            catch {
            }
            await this.sleep(interval);
        }
        this.logger.warn(`MX for ${domain} still not visible after ${options.maxWaitMs}ms`);
        return false;
    }
    async tryAttachInboundDomain(tenantId, options = {}) {
        const tenant = await this.getTenant(tenantId);
        if (!tenant.subdomain || !tenant.postmarkServerId)
            return false;
        const domainName = `${tenant.subdomain}.${EMAIL_DOMAIN}`;
        const retries = Math.max(0, options.retries ?? 0);
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                await this.postmark.updateServer(tenant.postmarkServerId, {
                    inboundDomain: domainName,
                    inboundHookUrl: this.buildInboundHookUrl(),
                });
                this.logger.log(`Attached InboundDomain "${domainName}" to Postmark server ${tenant.postmarkServerId}` +
                    (attempt > 0 ? ` (after ${attempt} retries)` : ''));
                return true;
            }
            catch (err) {
                const msg = err?.message || '';
                const transient = msg.toLowerCase().includes('mx record');
                if (!transient || attempt === retries) {
                    if (transient) {
                        this.logger.warn(`MX for ${domainName} not visible to Postmark yet; giving up this round (${msg})`);
                    }
                    else {
                        this.logger.warn(`Could not attach InboundDomain for ${domainName}: ${msg}`);
                    }
                    return false;
                }
                const backoff = 2000 * Math.pow(2, attempt);
                this.logger.log(`MX not visible yet (attempt ${attempt + 1}/${retries + 1}); retrying in ${backoff}ms`);
                await this.sleep(backoff);
            }
        }
        return false;
    }
    buildInboundHookUrl() {
        const auth = this.webhookAuth();
        const base = this.webhookBaseUrl();
        const path = '/api/v1/email/inbound/postmark';
        if (!auth)
            return `${base}${path}`;
        return `${base}${path}?token=${encodeURIComponent(auth.password)}`;
    }
    async refreshVerification(tenantId, postmarkDomainId) {
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
            this.logger.log(`Verification for tenant ${tenantId}: DKIM=${dkim.dkimVerified}, ReturnPath=${returnPath.returnPathVerified}`);
        }
        catch (err) {
            this.logger.warn(`Verification probe failed for tenant ${tenantId}: ${err?.message}`);
        }
    }
    async deprovision(tenantId) {
        const tenant = await this.getTenant(tenantId);
        const ids = this.extractRecordIds(tenant.cloudflareDnsRecordIds);
        for (const id of ids) {
            try {
                await this.cloudflare.deleteRecord(id);
            }
            catch (err) {
                this.logger.warn(`Failed to delete Cloudflare record ${id}: ${err?.message}`);
            }
        }
        if (tenant.subdomain) {
            const domainName = `${tenant.subdomain}.${EMAIL_DOMAIN}`;
            const leftovers = [
                domainName,
                `pm-bounces.${domainName}`,
            ];
            for (const name of leftovers) {
                await this.cloudflare.deleteByName(name).catch(() => undefined);
            }
            await this.cloudflare.deleteByName(`_domainkey.${domainName}`, 'TXT').catch(() => undefined);
        }
        if (tenant.postmarkServerId) {
            try {
                await this.postmark.deleteServer(tenant.postmarkServerId);
                this.logger.log(`Deleted Postmark server ${tenant.postmarkServerId}`);
            }
            catch (err) {
                this.logger.warn(`Failed to delete Postmark server ${tenant.postmarkServerId}: ${err?.message}`);
            }
        }
        if (tenant.postmarkDomainId) {
            try {
                await this.postmark.deleteDomain(tenant.postmarkDomainId);
            }
            catch (err) {
                this.logger.warn(`Failed to delete Postmark domain ${tenant.postmarkDomainId}: ${err?.message}`);
            }
        }
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
                cloudflareDnsRecordIds: client_1.Prisma.DbNull,
            },
        });
        this.logger.log(`Deprovisioned email infrastructure for tenant ${tenantId}`);
    }
    async getTenant(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException(`Tenant ${tenantId} not found`);
        return tenant;
    }
    extractRecordIds(raw) {
        if (!raw || !Array.isArray(raw))
            return [];
        return raw.filter((v) => typeof v === 'string');
    }
    stripTrailingDot(value) {
        return value.endsWith('.') ? value.slice(0, -1) : value;
    }
    async upsertDnsRecord(name, type, createFn) {
        try {
            const existing = await this.cloudflare.listByName(name);
            const match = existing.find((r) => r.type === type);
            if (match) {
                this.logger.log(`Adopting existing Cloudflare ${type} record ${match.id} for ${name}`);
                return match;
            }
        }
        catch (err) {
            this.logger.warn(`listByName for ${name} failed (will create): ${err?.message}`);
        }
        return createFn();
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.TenantEmailDomainService = TenantEmailDomainService;
exports.TenantEmailDomainService = TenantEmailDomainService = TenantEmailDomainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        postmark_service_1.PostmarkService,
        cloudflare_dns_service_1.CloudflareDnsService])
], TenantEmailDomainService);
//# sourceMappingURL=tenant-email-domain.service.js.map