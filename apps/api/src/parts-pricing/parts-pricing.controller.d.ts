import { PartsPricingService } from './parts-pricing.service';
declare class AnalyzePartsDto {
    auctionListingId: string;
}
export declare class PartsPricingController {
    private readonly partsPricingService;
    constructor(partsPricingService: PartsPricingService);
    analyze(dto: AnalyzePartsDto): Promise<{
        data: {
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
        }[];
    }>;
    getParts(auctionListingId: string): Promise<{
        data: {
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
        }[];
    }>;
}
export {};
