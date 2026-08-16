import { PrismaService } from '@htownautos/prisma';
export interface PortalPricing {
    inspectionFeeCents: number;
    travelFeeCents: number;
}
export declare class PortalPricingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPricing(tenantId: string): Promise<PortalPricing>;
    setPricing(tenantId: string, updates: Partial<PortalPricing>): Promise<PortalPricing>;
}
