import { MaxBidService } from './max-bid.service';
declare class MarketPriceDataDto {
    marketcheckPrice: number | null;
    msrp: number | null;
}
declare class CompsDataDto {
    listings: any[];
    numFound: number;
}
declare class CalculateMaxBidDto {
    auctionListingId: string;
    marketPriceData: MarketPriceDataDto;
    compsData: CompsDataDto;
}
export declare class MaxBidController {
    private readonly maxBidService;
    constructor(maxBidService: MaxBidService);
    calculate(dto: CalculateMaxBidDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            maxBid: import("@prisma/client-runtime-utils").Decimal;
            auctionListingId: bigint;
            analysis: string;
        };
    }>;
    getRecommendations(auctionListingId: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            maxBid: import("@prisma/client-runtime-utils").Decimal;
            auctionListingId: bigint;
            analysis: string;
        }[];
    }>;
}
export {};
