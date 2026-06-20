import { IsDefined, IsEnum, IsObject } from 'class-validator';
import { AuctionAnalysisType } from '@prisma/client';

export class UpsertAnalysisSnapshotDto {
  @IsEnum(AuctionAnalysisType)
  type: AuctionAnalysisType;

  @IsDefined()
  @IsObject()
  data: Record<string, unknown>;
}
