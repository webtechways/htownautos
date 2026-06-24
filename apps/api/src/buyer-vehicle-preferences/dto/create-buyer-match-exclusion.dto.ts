import { IsString, Matches } from 'class-validator';

export class CreateBuyerMatchExclusionDto {
  /** Lot number as a decimal string (BigInt-safe). Must be digits only. */
  @IsString()
  @Matches(/^\d+$/, { message: 'lotNumber must be a numeric string' })
  lotNumber!: string;
}
