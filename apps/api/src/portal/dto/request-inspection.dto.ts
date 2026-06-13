import {
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * Portal customer requests a vehicle inspection.
 * VIN + lotNumber identify the vehicle; dueAt is the preferred deadline.
 * Stripe Checkout is created server-side for PORTAL_INSPECTION_FEE_USD cents.
 */
export class RequestInspectionDto {
  @IsString()
  @MinLength(11)
  vin!: string;

  @IsOptional()
  @IsString()
  lotNumber?: string;

  @IsOptional()
  @IsString()
  yardNumber?: string;

  @IsOptional()
  @IsString()
  yardName?: string;

  /** Customer-specified notes / what to look at. */
  @IsOptional()
  @IsString()
  specificRequest?: string;

  /** ISO timestamp — preferred deadline (validated server-side). */
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
