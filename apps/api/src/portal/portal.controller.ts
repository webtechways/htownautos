import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CustomerGuard, CurrentBuyer, TenantOptional } from '@htownautos/auth';
import type { PortalBuyer } from '@htownautos/auth';
import { PortalService } from './portal.service';
import { UpdatePortalProfileDto } from './dto/update-portal-profile.dto';
import { InspectionCartDto } from './dto/inspection-cart.dto';
import { CreateDepositDto } from './dto/create-deposit.dto';

// CustomerGuard resolves the tenant from the Buyer, so the global TenantGuard
// must not require an org-based tenant on these routes.
@TenantOptional()
@UseGuards(CustomerGuard)
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  // ── Profile ───────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/portal/me
   * Returns safe Buyer profile fields. Does NOT expose SSN, credit, or income.
   */
  @Get('me')
  getMe(@CurrentBuyer() buyer: PortalBuyer) {
    return this.portalService.getProfile(buyer);
  }

  /**
   * PATCH /api/v1/portal/me
   * Updates name and phone numbers. All other fields require staff action.
   */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  updateMe(
    @CurrentBuyer() buyer: PortalBuyer,
    @Body() dto: UpdatePortalProfileDto,
  ) {
    return this.portalService.updateProfile(buyer, dto);
  }

  // Listings + pricing are PUBLIC — see PortalPublicController.

  // ── Inspections ───────────────────────────────────────────────────────────

  /**
   * GET /api/v1/portal/inspections
   * Returns only the calling buyer's inspections.
   */
  @Get('inspections')
  getInspections(@CurrentBuyer() buyer: PortalBuyer) {
    return this.portalService.getInspections(buyer);
  }

  /**
   * GET /api/v1/portal/inspections/:id
   * Returns a single inspection — 404 if it belongs to another buyer.
   */
  @Get('inspections/:id')
  getInspection(
    @Param('id') id: string,
    @CurrentBuyer() buyer: PortalBuyer,
  ) {
    return this.portalService.getInspection(id, buyer);
  }

  // inspections/quote is PUBLIC — see PortalPublicController.

  /**
   * POST /api/v1/portal/inspections/checkout
   * Recomputes total server-side, creates ONE PortalOrder (INSPECTION, PENDING)
   * with the full cart in metadata, creates a Stripe Checkout Session, and
   * returns the checkout URL.
   *
   * Body: { items: [{ lotNumber, vin?, yardId, yardName? }, ...] }
   */
  @Post('inspections/checkout')
  @HttpCode(HttpStatus.CREATED)
  checkoutInspections(
    @CurrentBuyer() buyer: PortalBuyer,
    @Body() dto: InspectionCartDto,
  ) {
    return this.portalService.checkoutInspections(buyer, dto);
  }

  // ── Ledger ────────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/portal/ledger
   * Returns all ledger entries + computed balance for the calling buyer.
   */
  @Get('ledger')
  getLedger(@CurrentBuyer() buyer: PortalBuyer) {
    return this.portalService.getLedger(buyer);
  }

  // ── Deposits ──────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/portal/deposits
   * Creates a Stripe Checkout Session for an arbitrary deposit amount (min $10).
   * Returns the checkout URL. LedgerEntry created on payment.
   */
  @Post('deposits')
  @HttpCode(HttpStatus.CREATED)
  createDeposit(
    @CurrentBuyer() buyer: PortalBuyer,
    @Body() dto: CreateDepositDto,
  ) {
    return this.portalService.createDeposit(buyer, dto);
  }
}
