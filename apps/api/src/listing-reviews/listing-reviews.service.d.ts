import { PrismaService } from '@htownautos/prisma';
export declare class ListingReviewsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getByLotNumber(tenantId: string, lotNumber: bigint): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        userId: string;
        lotNumber: bigint;
        checked: boolean;
        damageLevel: string | null;
    } | null>;
    upsert(tenantId: string, userId: string, lotNumber: bigint, data: {
        notes?: string;
        checked?: boolean;
        damageLevel?: string | null;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        userId: string;
        lotNumber: bigint;
        checked: boolean;
        damageLevel: string | null;
    }>;
}
