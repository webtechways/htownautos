import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PORTAL_TENANT_ID, Public, TenantOptional } from '@htownautos/auth';
import { PortalService } from './portal.service';
import { PortalPricingService } from './portal-pricing.service';
import { QueryCopartDto } from '../copart/dto/query-copart.dto';
import { InspectionCartDto } from './dto/inspection-cart.dto';

/**
 * Public (unauthenticated) portal endpoints. The marketing site lets anyone
 * browse the auction inventory and see inspection pricing BEFORE signing in;
 * login is only required to request an inspection, manage a cart, or deposit.
 *
 * Intentionally NOT guarded by CustomerGuard. Tenant-scoped data uses the
 * canonical HtownAutos tenant.
 */
@Public()
@TenantOptional()
@Controller('portal')
export class PortalPublicController {
  constructor(
    private readonly portalService: PortalService,
    private readonly pricingService: PortalPricingService,
  ) {}

  /** GET /api/v1/portal/listings — public auction listings. */
  @Get('listings')
  getListings(@Query() query: QueryCopartDto) {
    return this.portalService.getListings(query);
  }

  /** GET /api/v1/portal/listings/:lotNumber */
  @Get('listings/:lotNumber')
  getListingByLotNumber(@Param('lotNumber') lotNumber: string) {
    return this.portalService.getListingByLotNumber(lotNumber);
  }

  /** GET /api/v1/portal/pricing — fees for the canonical tenant (cart display). */
  @Get('pricing')
  getPricing() {
    return this.pricingService.getPricing(PORTAL_TENANT_ID);
  }

  /**
   * POST /api/v1/portal/inspections/quote — price breakdown for a cart.
   * Public (creates nothing) so the cart shows the total before sign-in.
   * Checkout still requires login.
   */
  @Post('inspections/quote')
  @HttpCode(HttpStatus.OK)
  quote(@Body() dto: InspectionCartDto) {
    return this.portalService.quotePublic(dto);
  }
}
