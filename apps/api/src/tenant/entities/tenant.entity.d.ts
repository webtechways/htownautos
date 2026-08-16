import { Tenant } from '@prisma/client';
export declare class TenantEntity implements Tenant {
    id: string;
    clerkOrgId: string | null;
    name: string;
    slug: string;
    subdomain: string | null;
    businessName: string | null;
    taxId: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string;
    settings: any;
    twilioMessagingServiceSid: string | null;
    logo: string | null;
    isActive: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    postmarkDomainId: number | null;
    postmarkDkimVerified: boolean;
    postmarkReturnPathVerified: boolean;
    emailProvisionedAt: Date | null;
    cloudflareDnsRecordIds: any;
    postmarkServerId: number | null;
    postmarkServerToken: string | null;
    postmarkWebhookId: number | null;
    feeConfig: any;
    constructor(partial: Partial<TenantEntity>);
}
export declare class TenantWithStatsEntity extends TenantEntity {
    userCount: number;
    vehicleCount: number;
    dealCount: number;
    buyerCount: number;
}
export declare class PaginatedTenantsEntity {
    data: TenantEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
