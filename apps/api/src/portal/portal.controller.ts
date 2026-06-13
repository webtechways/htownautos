import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CustomerGuard, CurrentBuyer } from '@htownautos/auth';
import type { PortalBuyer } from '@htownautos/auth';
import { PortalService } from './portal.service';
import { UpdatePortalProfileDto } from './dto/update-portal-profile.dto';
import { InspectionCartDto } from './dto/inspection-cart.dto';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { QueryCopartDto } from '../copart/dto/query-copart.dto';

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

  // ── Listings ──────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/portal/listings
   * Proxies to CopartService.findAll — public auction listings.
   */
  @Get('listings')
  getListings(@Query() query: QueryCopartDto) {
    return this.portalService.getListings(query);
  }

  /**
   * GET /api/v1/portal/listings/:lotNumber
   * Proxies to CopartService.findByLotNumber.
   */
  @Get('listings/:lotNumber')
  getListingByLotNumber(@Param('lotNumber') lotNumber: string) {
    return this.portalService.getListingByLotNumber(lotNumber);
  }

  // ── Pricing ───────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/portal/pricing
   * Returns the tenant's current {inspectionFeeCents, travelFeeCents} so the
   * cart can display fees before checkout.
   */
  @Get('pricing')
  getPricing(@CurrentBuyer() buyer: PortalBuyer) {
    return this.portalService.getPricingForBuyer(buyer);
  }

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

  /**
   * POST /api/v1/portal/inspections/quote
   * Computes and returns the pricing breakdown for a cart WITHOUT creating
   * any records. Safe to call multiple times.
   *
   * Body: { items: [{ lotNumber, vin?, yardId, yardName? }, ...] }
   */
  @Post('inspections/quote')
  @HttpCode(HttpStatus.OK)
  quoteInspections(
    @CurrentBuyer() buyer: PortalBuyer,
    @Body() dto: InspectionCartDto,
  ) {
    return this.portalService.quoteInspections(buyer, dto);
  }

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
