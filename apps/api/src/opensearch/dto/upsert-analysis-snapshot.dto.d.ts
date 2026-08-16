import { AuctionAnalysisType } from '@prisma/client';
export declare class UpsertAnalysisSnapshotDto {
    type: AuctionAnalysisType;
    data: Record<string, unknown>;
}
