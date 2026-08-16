import { PrismaService } from '@htownautos/prisma';
export declare class AdminSeedService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    seedBuyers(tenantId: string, count?: number, daysBack?: number): Promise<{
        created: number;
        requested: number;
        tenantId: string;
        marker: string;
        emailDomain: string;
    }>;
    deleteSeedBuyers(tenantId: string): Promise<{
        deleted: number;
    }>;
}
