import { ListingReviewsService } from './listing-reviews.service';
declare class UpsertReviewDto {
    notes?: string;
    checked?: boolean;
    damageLevel?: string | null;
}
export declare class ListingReviewsController {
    private readonly service;
    private readonly logger;
    constructor(service: ListingReviewsService);
    get(tenantId: string, lotNumber: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            notes: string | null;
            userId: string;
            lotNumber: bigint;
            checked: boolean;
            damageLevel: string | null;
        } | null;
    }>;
    upsert(tenantId: string, userId: string, lotNumber: string, dto: UpsertReviewDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            notes: string | null;
            userId: string;
            lotNumber: bigint;
            checked: boolean;
            damageLevel: string | null;
        };
    }>;
}
export {};
