import { IsOptional, IsString } from 'class-validator';

export class ToggleBuyerFavoriteDto {
  /** Auction lot number (BigInt as string). Provide this or `vin`. */
  @IsOptional()
  @IsString()
  lotNumber?: string;

  /** VIN — resolved to the most recent auction listing for that VIN. Provide this or `lotNumber`. */
  @IsOptional()
  @IsString()
  vin?: string;
}
