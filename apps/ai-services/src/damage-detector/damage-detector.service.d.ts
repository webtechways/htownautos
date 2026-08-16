import { PrismaService } from '@htownautos/prisma';
export declare class DamageDetectorService {
    private readonly prisma;
    private readonly logger;
    private readonly openai;
    constructor(prisma: PrismaService);
    analyzeImages(auctionListingId: string, imageUrls: string[]): Promise<any>;
    getDamagePercents(ids: string[]): Promise<Record<string, number>>;
    getAnalyses(auctionListingId: string): Promise<({
        damages: ({
            partsPrices: {
                url: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                source: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                damageAiId: string;
                image: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            part: string;
            description: string | null;
            level: number;
            auctionVehicleAnalysisId: string;
            partCost: import("@prisma/client-runtime-utils").Decimal;
            laborCost: import("@prisma/client-runtime-utils").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        auctionListingId: bigint;
        damagePercent: number | null;
    })[]>;
}
