import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
export interface DamageItem {
    part: string;
    description: string | null;
    level: number;
    partCost: string;
    laborCost: string;
}
export interface DamagesBlock {
    id: string;
    createdAt: Date;
    items: DamageItem[];
}
export interface PartsPricingItem {
    part: string;
    description: string | null;
    priceMin: string;
    priceMax: string;
    priceAvg: string;
    source: string;
}
export interface MaxBidBlock {
    maxBid: string;
    analysis: string;
    createdAt: Date;
}
export interface CarfaxBlock {
    hasReport: boolean;
    aiSummary: string | null;
    analysis: string | null;
    signedUrl?: string;
    date?: Date | null;
}
export interface InspectionAuctionAnalysis {
    damages: DamagesBlock | null;
    parts: PartsPricingItem[] | null;
    maxBid: MaxBidBlock | null;
    marketCheck: unknown | null;
    comparables: unknown | null;
    auctionHistory: unknown | null;
    carfax: CarfaxBlock;
}
export declare class AuctionAnalysisService {
    private readonly prisma;
    private readonly s3;
    private readonly logger;
    constructor(prisma: PrismaService, s3: S3Service);
    gatherForLot(lotNumber: string | null): Promise<InspectionAuctionAnalysis>;
}
