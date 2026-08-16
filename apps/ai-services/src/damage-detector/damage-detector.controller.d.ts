import { DamageDetectorService } from './damage-detector.service';
declare class AnalyzeDamagesDto {
    auctionListingId: string;
    imageUrls: string[];
}
export declare class DamageDetectorController {
    private readonly damageDetectorService;
    constructor(damageDetectorService: DamageDetectorService);
    analyze(dto: AnalyzeDamagesDto): Promise<{
        data: any;
    }>;
    batch(body: {
        ids: string[];
    }): Promise<{
        data: Record<string, number>;
    }>;
    getAnalyses(auctionListingId: string): Promise<{
        data: ({
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
        })[];
    }>;
}
export {};
