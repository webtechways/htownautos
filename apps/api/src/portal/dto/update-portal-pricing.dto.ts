import { IsOptional, IsInt, Min, Max } from 'class-validator';

/** Maximum reasonable inspection fee: $999.99 (99999 cents). */
const MAX_INSPECTION_FEE_CENTS = 99_999;

/** Maximum reasonable travel fee: $999.99 (99999 cents). */
const MAX_TRAVEL_FEE_CENTS = 99_999;

/**
 * PATCH /api/v1/portal-settings/pricing
 * Staff-only. Merges provided values into Tenant.settings.portal.
 */
export class UpdatePortalPricingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_INSPECTION_FEE_CENTS)
  inspectionFeeCents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_TRAVEL_FEE_CENTS)
  travelFeeCents?: number;
}
