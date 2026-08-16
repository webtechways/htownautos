import { PrismaService } from '@htownautos/prisma';
import { Tenant } from '@prisma/client';
import { PostmarkService } from '../postmark/postmark.service';
import { CloudflareDnsService } from '../cloudflare/cloudflare-dns.service';
export declare class TenantEmailDomainService {
    private prisma;
    private postmark;
    private cloudflare;
    private readonly logger;
    constructor(prisma: PrismaService, postmark: PostmarkService, cloudflare: CloudflareDnsService);
    ensureProvisioned(tenantId: string): Promise<Tenant>;
    private webhookBaseUrl;
    private webhookAuth;
    provision(tenantId: string): Promise<void>;
    private waitForMxPropagation;
    tryAttachInboundDomain(tenantId: string, options?: {
        retries?: number;
    }): Promise<boolean>;
    private buildInboundHookUrl;
    refreshVerification(tenantId: string, postmarkDomainId: number): Promise<void>;
    deprovision(tenantId: string): Promise<void>;
    private getTenant;
    private extractRecordIds;
    private stripTrailingDot;
    private upsertDnsRecord;
    private sleep;
}
