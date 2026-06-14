import { IsNotEmpty, IsString } from 'class-validator';

export class ToggleBuyerFavoriteDto {
  /** Auction lot number (BigInt as string). */
  @IsNotEmpty()
  @IsString()
  lotNumber: string;
}
