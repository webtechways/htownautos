import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class DiscardAuctionDto {
  @IsBoolean()
  discarded: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
