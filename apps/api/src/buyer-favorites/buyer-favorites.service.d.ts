import { PrismaService } from '@htownautos/prisma';
export declare class BuyerFavoritesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private serializeListing;
    add(buyerId: string, tenantId: string | null, opts: {
        lotNumber?: string;
        vin?: string;
    }): Promise<{
        id: string;
        lotNumber: string;
        added: boolean;
    }>;
    remove(buyerId: string, lotNumberStr: string): Promise<{
        lotNumber: string;
        removed: boolean;
    }>;
    getIds(buyerId: string): Promise<string[]>;
    list(buyerId: string, tenantId?: string | null): Promise<{
        id: string;
        lotNumber: string;
        createdAt: Date;
        listing: {
            lotNumber: string;
            inspectable: boolean;
        } | null;
    }[]>;
}
