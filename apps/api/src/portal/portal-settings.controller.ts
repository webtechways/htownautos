import {
  Controller,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ClerkJwtGuard,
  TenantGuard,
  RolesGuard,
  CurrentTenant,
  RequireRoles,
} from '@htownautos/auth';
import { PortalPricingService } from './portal-pricing.service';
import { UpdatePortalPricingDto } from './dto/update-portal-pricing.dto';

/**
 * Staff-only controller for configuring per-tenant portal settings.
 * Secured with ClerkJwtGuard + TenantGuard + RolesGuard.
 * All mutations are scoped to the caller's tenantId — no cross-tenant access.
 */
@UseGuards(ClerkJwtGuard, TenantGuard, RolesGuard)
@Controller('portal-settings')
export class PortalSettingsController {
  constructor(private readonly pricingService: PortalPricingService) {}

  /**
   * GET /api/v1/portal-settings/pricing
   * Returns the current inspection + travel fee configuration for the caller's tenant.
   */
  @Get('pricing')
  @RequireRoles('admin')
  getPricing(@CurrentTenant() tenantId: string) {
    return this.pricingService.getPricing(tenantId);
  }

  /**
   * PATCH /api/v1/portal-settings/pricing
   * Merges the provided fee values into Tenant.settings.portal.
   * Only fields present in the body are updated; omitted fields retain their current value.
   */
  @Patch('pricing')
  @RequireRoles('admin')
  @HttpCode(HttpStatus.OK)
  updatePricing(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdatePortalPricingDto,
  ) {
    return this.pricingService.setPricing(tenantId, dto);
  }
}
