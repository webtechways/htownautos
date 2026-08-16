import { PrismaService } from '@htownautos/prisma';
export declare class PartsPricingService {
    private readonly prisma;
    private readonly logger;
    private readonly openai;
    constructor(prisma: PrismaService);
    analyzeParts(auctionListingId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        part: string;
        description: string | null;
        source: string;
        auctionListingId: bigint;
        priceMin: import("@prisma/client-runtime-utils").Decimal;
        priceMax: import("@prisma/client-runtime-utils").Decimal;
        priceAvg: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getParts(auctionListingId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        part: string;
        description: string | null;
        source: string;
        auctionListingId: bigint;
        priceMin: import("@prisma/client-runtime-utils").Decimal;
        priceMax: import("@prisma/client-runtime-utils").Decimal;
        priceAvg: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
}
