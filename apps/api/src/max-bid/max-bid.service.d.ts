import { PrismaService } from '@htownautos/prisma';
export declare class MaxBidService {
    private readonly prisma;
    private readonly logger;
    private readonly openai;
    constructor(prisma: PrismaService);
    calculateMaxBid(auctionListingId: string, marketPriceData: {
        marketcheckPrice: number | null;
        msrp: number | null;
    }, compsData: {
        listings: any[];
        numFound: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        maxBid: import("@prisma/client-runtime-utils").Decimal;
        auctionListingId: bigint;
        analysis: string;
    }>;
    getRecommendations(auctionListingId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        maxBid: import("@prisma/client-runtime-utils").Decimal;
        auctionListingId: bigint;
        analysis: string;
    }[]>;
    private buildPrompt;
}
