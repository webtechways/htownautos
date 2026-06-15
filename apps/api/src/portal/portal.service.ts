import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import type { PortalBuyer } from '@htownautos/auth';
import { PORTAL_TENANT_ID } from '@htownautos/auth';
import { CopartService } from '../copart/copart.service';
import { QueryCopartDto } from '../copart/dto/query-copart.dto';
import { AuctionSearchService } from '../opensearch/auction-search.service';
import { VehicleInspectionsService } from '../vehicle-inspections/vehicle-inspections.service';
import { UpdatePortalProfileDto } from './dto/update-portal-profile.dto';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { InspectionCartDto, CartItemDto } from './dto/inspection-cart.dto';
import { PortalPricingService, PortalPricing } from './portal-pricing.service';

// ── Constants ─────────────────────────────────────────────────────────────────

/** Minimum deposit amount in cents ($10). */
const MIN_DEPOSIT_CENTS = 1000;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Safe Buyer fields returned to portal customers. */
const BUYER_SAFE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneMain: true,
  phoneMobile: true,
  phoneSecondary: true,
  currentAddress: true,
  currentCity: true,
  currentState: true,
  currentZipCode: true,
  currentCountry: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.BuyerSelect;

/** Per-yard group used for breakdown computation. */
interface YardGroup {
  yardId: string;
  yardName: string | undefined;
  cars: CartItemDto[];
}

/** Resolved yard fee data from the DB. */
interface YardFeeData {
  travelFeeCents: number;
  minCars: number;
  name: string;
}

/** Full quote breakdown. */
export interface InspectionQuote {
  items: CartItemDto[];
  byYard: Array<{
    yardId: string;
    yardName?: string;
    cars: number;
    travelFeeCents: number;
    minCars: number;
  }>;
  carsCount: number;
  yardsCount: number;
  inspectionFeeCents: number;
  travelFeeCents: number;
  inspectionSubtotalCents: number;
  travelSubtotalCents: number;
  totalCents: number;
  currency: 'usd';
  /** Present only when checkout=true and a yard fails minCars; empty array at quote time. */
  minCarsViolations: Array<{ yardId: string; yardName: string; required: number; actual: number }>;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly copartService: CopartService,
    private readonly inspectionsService: VehicleInspectionsService,
    private readonly pricingService: PortalPricingService,
    private readonly auctionSearchService: AuctionSearchService,
    private readonly s3: S3Service,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  async getProfile(buyer: PortalBuyer) {
    // Re-read from DB to ensure freshest data, scoped to buyer + tenant.
    const row = await this.prisma.buyer.findFirst({
      where: { id: buyer.id, tenantId: buyer.tenantId },
      select: BUYER_SAFE_SELECT,
    });
    if (!row) throw new NotFoundException('Buyer profile not found');
    return row;
  }

  async updateProfile(buyer: PortalBuyer, dto: UpdatePortalProfileDto) {
    const data: Prisma.BuyerUpdateInput = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.phoneMain !== undefined) data.phoneMain = dto.phoneMain;
    if (dto.phoneMobile !== undefined) data.phoneMobile = dto.phoneMobile;
    if (dto.phoneSecondary !== undefined)
      data.phoneSecondary = dto.phoneSecondary;

    const updated = await this.prisma.buyer.update({
      where: { id: buyer.id },
      data,
      select: BUYER_SAFE_SELECT,
    });
    return updated;
  }

  // ── Listings (proxy to CopartService) ────────────────────────────────────

  async getListings(query: QueryCopartDto) {
    return this.copartService.findAll(query);
  }

  async getListingByLotNumber(lotNumber: string) {
    const listing = await this.copartService.findByLotNumber(lotNumber);
    if (!listing) {
      throw new NotFoundException(
        `Listing with lot number ${lotNumber} not found`,
      );
    }
    return listing;
  }

  /**
   * Returns distinct filter option lists from the auction_listings table.
   * Used to populate public-facing dropdowns (makes, years, damage types, etc.).
   */
  getFilters() {
    return this.copartService.getFilterOptions();
  }

  /**
   * Returns the full image gallery for a lot.
   * Reads galleryCache from Postgres (TTL 30d); on miss, fetches from Copart
   * via ProxyService and queues a background cache write.
   * Returns { lotNumber, imageCount: 0, images: [] } for unknown lots.
   */
  async getListingGallery(lotNumber: string) {
    try {
      return await this.auctionSearchService.getCopartGallery(lotNumber);
    } catch (err) {
      // NotFoundException means the lot doesn't exist in our DB — return empty gallery.
      if ((err as any)?.status === 404 || err?.constructor?.name === 'NotFoundException') {
        return { lotNumber, imageCount: 0, images: [] };
      }
      throw err;
    }
  }

  // ── Pricing ───────────────────────────────────────────────────────────────

  /**
   * Returns the pricing configuration for the buyer's tenant.
   * Exposed to customers so the cart can display fees before checkout.
   */
  getPricingForBuyer(buyer: PortalBuyer) {
    return this.pricingService.getPricing(buyer.tenantId);
  }

  // ── Inspections ───────────────────────────────────────────────────────────

  async getInspections(buyer: PortalBuyer) {
    return this.inspectionsService.list(
      buyer.tenantId,
      null,
      { buyerId: buyer.id } as any,
    );
  }

  async getInspection(id: string, buyer: PortalBuyer) {
    // get() already enforces tenantId; we additionally verify buyerId.
    const inspection = await this.inspectionsService.get(
      id,
      buyer.tenantId,
      null,
    );
    if ((inspection as any).buyerId !== buyer.id) {
      throw new NotFoundException(`Inspection ${id} not found`);
    }
    await this.signInspectionMedia(inspection);

    // Fetch and attach Carfax reports — same shape the dashboard expects.
    const carfax = await this.fetchAndSignCarfax(
      (inspection as any).vin,
      (inspection as any).lotNumber,
    );

    return { ...inspection, carfax };
  }

  /**
   * Pre-sign every media URL (6h TTL) so the website can render the photos/
   * videos directly — mirrors the public share-link view. Best-effort: a
   * broken storageKey just won't display.
   */
  private async signInspectionMedia(inspection: any): Promise<void> {
    const MEDIA_SIGNED_URL_TTL = 60 * 60 * 6;
    const allMedia: { storageKey?: string | null; url?: string }[] = [
      ...(inspection.media ?? []),
      ...((inspection.checklist ?? []).flatMap((c: any) => c.media ?? [])),
      ...((inspection.requestItems ?? []).flatMap((r: any) => r.media ?? [])),
    ];
    await Promise.all(
      allMedia.map(async (m) => {
        if (!m.storageKey) return;
        try {
          m.url = await this.s3.getSignedUrl(m.storageKey, MEDIA_SIGNED_URL_TTL);
        } catch {
          /* swallow — broken keys just don't display */
        }
      }),
    );
  }

  /**
   * Fetch Carfax reports for a vehicle (by VIN and optionally lot number) and
   * pre-sign any S3-stored PDF keys. Reuses the same query logic as
   * InspectionShareLinksService.fetchCarfaxForVehicle (kept private there, so
   * we duplicate the minimal query here rather than exposing an internal method).
   */
  private async fetchAndSignCarfax(
    vin: string,
    lotNumber: string | null,
  ): Promise<any[]> {
    const CARFAX_SIGNED_URL_TTL = 60 * 60 * 6;
    const orClauses: Prisma.CarfaxReportWhereInput[] = [{ vin }];
    if (lotNumber) {
      try {
        orClauses.push({ auctionListingId: BigInt(lotNumber) });
      } catch {
        /* non-numeric lot */
      }
    }
    const reports = await this.prisma.carfaxReport.findMany({
      where: { OR: orClauses },
      orderBy: { createdAt: 'desc' },
    });
    await Promise.all(
      reports.map(async (r: any) => {
        if (!r.s3Key) return;
        try {
          r.signedUrl = await this.s3.getSignedUrl(r.s3Key, CARFAX_SIGNED_URL_TTL);
        } catch {
          /* swallow */
        }
      }),
    );
    return reports;
  }

  // ── Special requests ──────────────────────────────────────────────────────

  /**
   * Customer adds a special request note to an inspection that is still
   * in REQUESTED status. Creates an InspectionRequestItem using the same
   * model the staff dashboard uses.
   *
   * Validates:
   *  1. The inspection belongs to the calling buyer (403/404 otherwise).
   *  2. The inspection status === 'REQUESTED' (400 otherwise).
   */
  async addInspectionRequest(
    id: string,
    buyer: PortalBuyer,
    text: string,
  ) {
    // Fetch lean fields only — avoid a heavy include on this write path.
    const inspection = await this.prisma.vehicleInspection.findFirst({
      where: { id, tenantId: buyer.tenantId },
      select: { id: true, buyerId: true, status: true },
    });

    if (!inspection || inspection.buyerId !== buyer.id) {
      throw new NotFoundException(`Inspection ${id} not found`);
    }

    if (inspection.status !== 'REQUESTED') {
      throw new BadRequestException(
        'Solo puedes agregar solicitudes mientras la inspección está en estado solicitada',
      );
    }

    return this.prisma.inspectionRequestItem.create({
      data: {
        inspectionId: id,
        note: text,
        sortOrder: 0,
      },
      include: { media: true },
    });
  }

  // ── Order receipt + payment confirmation ───────────────────────────────────

  /**
   * Confirm a checkout by Stripe session id and return receipt data.
   * Acts as a FALLBACK to the webhook: if the order is still PENDING but Stripe
   * says the session is paid, fulfil it here (idempotent) so the inspections /
   * deposit get created even when the webhook didn't deliver.
   */
  async confirmOrderBySession(buyer: PortalBuyer, sessionId: string) {
    const order = await this.prisma.portalOrder.findFirst({
      where: { stripeCheckoutSessionId: sessionId, buyerId: buyer.id },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === 'PENDING') {
      try {
        const session =
          await this.stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
          await this.fulfillPortalOrder(session);
        }
      } catch (err) {
        this.logger.warn(
          `confirmOrderBySession ${sessionId}: ${(err as any)?.message}`,
        );
      }
    }

    const fresh =
      (await this.prisma.portalOrder.findUnique({
        where: { id: order.id },
      })) ?? order;
    const meta: any = fresh.metadata ?? {};
    return {
      orderId: fresh.id,
      receiptNumber: fresh.id.slice(0, 8).toUpperCase(),
      type: fresh.type,
      status: fresh.status,
      amountCents: Math.round(Number(fresh.amount) * 100),
      currency: fresh.currency,
      description: fresh.description,
      items: meta.items ?? [],
      breakdown: meta.pricing ?? meta.breakdown ?? null,
      createdAt: fresh.createdAt,
    };
  }

  // ── Quote ─────────────────────────────────────────────────────────────────

  /**
   * Computes a pricing breakdown for the cart WITHOUT creating any records.
   * Safe to call multiple times (read-only).
   * Soft validation: minCars violations are returned in the response (not thrown)
   * so the website can warn before the customer reaches checkout.
   */
  async quoteInspections(
    buyer: PortalBuyer,
    dto: InspectionCartDto,
  ): Promise<InspectionQuote> {
    const pricing = await this.pricingService.getPricing(buyer.tenantId);
    const yardFees = await this.resolveYardFees(dto.items);
    return this.computeQuote(dto.items, pricing, yardFees, false);
  }

  /**
   * Public quote — same breakdown, no auth, using the canonical tenant's fees.
   * Lets the cart show the price before the customer signs in. Creates nothing.
   * Soft validation: minCars violations returned but not thrown.
   */
  async quotePublic(dto: InspectionCartDto): Promise<InspectionQuote> {
    const pricing = await this.pricingService.getPricing(PORTAL_TENANT_ID);
    const yardFees = await this.resolveYardFees(dto.items);
    return this.computeQuote(dto.items, pricing, yardFees, false);
  }

  // ── Checkout ──────────────────────────────────────────────────────────────

  /**
   * CART CHECKOUT flow:
   *  1. Recompute total server-side (never trust client amounts).
   *  2. Create ONE PortalOrder (INSPECTION, PENDING) storing full cart in metadata.
   *  3. Create a Stripe Checkout Session for totalCents.
   *  4. Link session ID back to the order.
   *  5. Return the checkout URL.
   *
   * VehicleInspection rows are created later, in fulfillInspectionOrder,
   * after payment is confirmed via webhook.
   */
  async checkoutInspections(buyer: PortalBuyer, dto: InspectionCartDto) {
    const pricing = await this.pricingService.getPricing(buyer.tenantId);
    const yardFees = await this.resolveYardFees(dto.items);
    // Hard validation: throws BadRequestException if any yard fails minCars.
    const quote = this.computeQuote(dto.items, pricing, yardFees, true);

    const description = `Vehicle inspections — ${quote.carsCount} car${quote.carsCount !== 1 ? 's' : ''}, ${quote.yardsCount} yard${quote.yardsCount !== 1 ? 's' : ''}`;

    // Create the PortalOrder first so we have an ID for Stripe metadata.
    const order = await this.prisma.portalOrder.create({
      data: {
        tenantId: buyer.tenantId,
        buyerId: buyer.id,
        type: 'INSPECTION',
        status: 'PENDING',
        amount: new Prisma.Decimal(quote.totalCents / 100),
        currency: 'usd',
        description,
        // Prisma requires a plain JSON-serializable object for Json fields.
        metadata: JSON.parse(
          JSON.stringify({
            items: dto.items,
            pricing: {
              inspectionFeeCents: pricing.inspectionFeeCents,
              travelFeeCents: pricing.travelFeeCents,
            },
            quote: {
              byYard: quote.byYard,
              carsCount: quote.carsCount,
              yardsCount: quote.yardsCount,
              inspectionSubtotalCents: quote.inspectionSubtotalCents,
              travelSubtotalCents: quote.travelSubtotalCents,
              totalCents: quote.totalCents,
            },
          }),
        ),
      },
    });

    const stripeCustomerId = await this.getOrCreateStripeCustomer(buyer);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            // Server-computed total — the single source of truth.
            unit_amount: quote.totalCents,
            product_data: {
              name: `Vehicle Inspections (${quote.carsCount} car${quote.carsCount !== 1 ? 's' : ''}, ${quote.yardsCount} yard${quote.yardsCount !== 1 ? 's' : ''})`,
              description: quote.byYard
                .map(
                  (y) =>
                    `${y.yardName ?? y.yardId}: ${y.cars} car${y.cars !== 1 ? 's' : ''}`,
                )
                .join(' | '),
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        description,
        metadata: {
          portalOrderId: order.id,
          buyerId: buyer.id,
          tenantId: buyer.tenantId,
        },
      },
      metadata: {
        portalOrderId: order.id,
        buyerId: buyer.id,
        tenantId: buyer.tenantId,
        orderType: 'INSPECTION',
      },
      success_url: `${this.portalBaseUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.portalBaseUrl()}/payment/canceled?session_id={CHECKOUT_SESSION_ID}`,
    });

    // Link the Stripe session ID back to the order.
    await this.prisma.portalOrder.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    this.logger.log(
      `Portal inspection order ${order.id} created (${quote.carsCount} cars, ${quote.yardsCount} yards, $${(quote.totalCents / 100).toFixed(2)}) — Stripe session ${session.id}`,
    );

    return {
      orderId: order.id,
      url: session.url,
      checkoutUrl: session.url,
      totalCents: quote.totalCents,
      currency: 'usd' as const,
      breakdown: quote,
    };
  }

  // ── Ledger ────────────────────────────────────────────────────────────────

  /**
   * Returns all ledger entries for the buyer plus a computed running balance.
   * Balance = sum(DEPOSIT+REFUND where COMPLETED) - sum(CHARGE+APPLIED where COMPLETED).
   */
  async getLedger(buyer: PortalBuyer) {
    const entries = await this.prisma.customerLedgerEntry.findMany({
      where: { buyerId: buyer.id, tenantId: buyer.tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        currency: true,
        description: true,
        source: true,
        stripePaymentIntentId: true,
        relatedInspectionId: true,
        createdAt: true,
      },
    });

    let balanceCents = 0;
    for (const e of entries) {
      if (e.status !== 'COMPLETED') continue;
      const cents = Math.round(Number(e.amount) * 100);
      if (e.type === 'DEPOSIT' || e.type === 'REFUND') {
        balanceCents += cents;
      } else if (e.type === 'CHARGE' || e.type === 'APPLIED') {
        balanceCents -= cents;
      }
      // ADJUSTMENT: positive amount = credit, negative = debit
      else if (e.type === 'ADJUSTMENT') {
        balanceCents += cents;
      }
    }

    return {
      entries: entries.map((e) => ({
        ...e,
        amount: e.amount.toString(),
      })),
      balanceCents,
      balanceFormatted: `$${(balanceCents / 100).toFixed(2)}`,
    };
  }

  // ── Deposits ──────────────────────────────────────────────────────────────

  /**
   * Create a Stripe Checkout Session for an arbitrary deposit amount.
   * The CustomerLedgerEntry is created in the webhook handler after payment.
   */
  async createDeposit(buyer: PortalBuyer, dto: CreateDepositDto) {
    if (dto.amountCents < MIN_DEPOSIT_CENTS) {
      // Validated by DTO; this is a belt-and-suspenders guard.
      throw new Error(
        `Minimum deposit is $${(MIN_DEPOSIT_CENTS / 100).toFixed(2)}`,
      );
    }

    const order = await this.prisma.portalOrder.create({
      data: {
        tenantId: buyer.tenantId,
        buyerId: buyer.id,
        type: 'DEPOSIT',
        status: 'PENDING',
        amount: new Prisma.Decimal(dto.amountCents / 100),
        currency: 'usd',
        description: 'Account deposit',
      },
    });

    const stripeCustomerId = await this.getOrCreateStripeCustomer(buyer);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: dto.amountCents,
            product_data: { name: 'Account Deposit' },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        description: 'Portal account deposit',
        metadata: {
          portalOrderId: order.id,
          buyerId: buyer.id,
          tenantId: buyer.tenantId,
        },
      },
      metadata: {
        portalOrderId: order.id,
        buyerId: buyer.id,
        tenantId: buyer.tenantId,
        orderType: 'DEPOSIT',
      },
      success_url: `${this.portalBaseUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.portalBaseUrl()}/payment/canceled?session_id={CHECKOUT_SESSION_ID}`,
    });

    await this.prisma.portalOrder.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    this.logger.log(
      `Portal deposit order ${order.id} created — Stripe session ${session.id}`,
    );

    return {
      orderId: order.id,
      url: session.url,
      checkoutUrl: session.url,
      amountCents: dto.amountCents,
    };
  }

  // ── Stripe fulfillment (called from StripeService webhook) ────────────────

  /**
   * Processes a `checkout.session.completed` event for a PortalOrder.
   * Idempotent — safe to call multiple times with the same session ID.
   */
  async fulfillPortalOrder(session: Stripe.Checkout.Session): Promise<void> {
    const portalOrderId = session.metadata?.portalOrderId;
    if (!portalOrderId) return; // Not a portal order — skip.

    const order = await this.prisma.portalOrder.findUnique({
      where: { id: portalOrderId },
    });
    if (!order) {
      this.logger.warn(
        `fulfillPortalOrder: PortalOrder ${portalOrderId} not found`,
      );
      return;
    }

    // Idempotency guard.
    if (order.status === 'PAID' || order.status === 'FULFILLED') {
      this.logger.log(
        `fulfillPortalOrder: order ${portalOrderId} already ${order.status} — skipping`,
      );
      return;
    }

    const piId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    // Mark PAID first.
    await this.prisma.portalOrder.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        stripePaymentIntentId: piId ?? undefined,
      },
    });

    if (order.type === 'INSPECTION') {
      await this.fulfillInspectionOrder(order, piId);
    } else if (order.type === 'DEPOSIT') {
      await this.fulfillDepositOrder(order, piId);
    }
  }

  // ── Private: fulfillment helpers ──────────────────────────────────────────

  /**
   * Cart fulfillment: creates one VehicleInspection per item in metadata.items.
   * Falls back gracefully to single-inspection (legacy metadata shape) so any
   * orders created before the cart migration still get fulfilled correctly.
   *
   * Idempotency: the outer guard in fulfillPortalOrder checks order.status
   * BEFORE we enter here, so if we were already FULFILLED we never re-enter.
   */
  private async fulfillInspectionOrder(
    order: {
      id: string;
      buyerId: string;
      tenantId: string | null;
      metadata: unknown;
    },
    piId: string | null,
  ): Promise<void> {
    const meta = (order.metadata ?? {}) as Record<string, unknown>;
    const tenantId = order.tenantId ?? '';

    // ── Determine cart items ────────────────────────────────────────────────
    // New shape: metadata.items = CartItemDto[]
    // Legacy shape (single inspection): metadata.vin, metadata.lotNumber, etc.
    let items: CartItemDto[];

    const rawItems = meta['items'];
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      items = rawItems as CartItemDto[];
    } else {
      // Legacy single-car order — reconstruct a synthetic cart item.
      const vin = (meta['vin'] as string) ?? '';
      if (!vin) {
        this.logger.error(
          `fulfillInspectionOrder: PortalOrder ${order.id} has no VIN and no items in metadata`,
        );
        return;
      }
      items = [
        {
          lotNumber: (meta['lotNumber'] as string) ?? '',
          vin,
          yardId: (meta['yardNumber'] as string) ?? '',
          yardName: (meta['yardName'] as string) ?? undefined,
        },
      ];
    }

    // ── Create one VehicleInspection per cart item ──────────────────────────
    const createdIds: string[] = [];

    for (const item of items) {
      try {
        const inspection = await this.inspectionsService.create(
          tenantId,
          null,
          {
            vin: item.vin ?? item.lotNumber, // fallback: lot as vin placeholder
            lotNumber: item.lotNumber || undefined,
            yardId: item.yardId || undefined,
            yardName: item.yardName || undefined,
            buyerId: order.buyerId,
            status: 'REQUESTED',
          } as any,
        );
        createdIds.push((inspection as any).id);
        this.logger.log(
          `fulfillInspectionOrder: created inspection ${(inspection as any).id} for lot ${item.lotNumber} (order ${order.id})`,
        );
      } catch (err) {
        this.logger.error(
          `fulfillInspectionOrder: failed to create inspection for lot ${item.lotNumber} (order ${order.id}): ${(err as Error).message}`,
        );
        // Continue processing the rest of the cart — do not abort the entire
        // fulfillment because one item failed.
      }
    }

    // Store created inspection IDs in metadata and mark FULFILLED.
    const updatedMetadata = {
      ...(meta as object),
      fulfilledInspectionIds: createdIds,
    };

    await this.prisma.portalOrder.update({
      where: { id: order.id },
      data: {
        status: 'FULFILLED',
        // Link the first inspection for the legacy relatedInspectionId column.
        ...(createdIds.length > 0 && {
          relatedInspectionId: createdIds[0],
        }),
        metadata: updatedMetadata,
      },
    });

    this.logger.log(
      `fulfillInspectionOrder: order ${order.id} FULFILLED — ${createdIds.length}/${items.length} inspections created`,
    );
  }

  private async fulfillDepositOrder(
    order: {
      id: string;
      buyerId: string;
      tenantId: string | null;
      amount: Prisma.Decimal;
      currency: string;
    },
    piId: string | null,
  ): Promise<void> {
    await this.prisma.customerLedgerEntry.create({
      data: {
        tenantId: order.tenantId,
        buyerId: order.buyerId,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        amount: order.amount,
        currency: order.currency,
        description: 'Portal deposit',
        source: 'stripe',
        stripePaymentIntentId: piId,
      },
    });

    await this.prisma.portalOrder.update({
      where: { id: order.id },
      data: { status: 'FULFILLED' },
    });

    this.logger.log(
      `fulfillDepositOrder: order ${order.id} fulfilled — ledger entry created`,
    );
  }

  // ── Private: pricing computation ──────────────────────────────────────────

  /**
   * Resolve per-yard fee data from the DB for a set of cart items.
   * Missing yards fall back to defaults (5000 cents, minCars=1).
   */
  private async resolveYardFees(
    items: CartItemDto[],
  ): Promise<Map<string, YardFeeData>> {
    const yardIds = Array.from(new Set(items.map((i) => i.yardId)));
    const rows = await this.prisma.yard.findMany({
      where: { id: { in: yardIds } },
      select: { id: true, name: true, travelFeeCents: true, minCars: true },
    });
    const map = new Map<string, YardFeeData>();
    for (const r of rows) {
      map.set(r.id, {
        travelFeeCents: r.travelFeeCents,
        minCars: r.minCars,
        name: r.name,
      });
    }
    return map;
  }

  /**
   * Groups items by yardId and computes totals using per-yard travel fees.
   *
   * Formula:
   *   total = (numberOfCars × inspectionFeeCents) + Σ over distinct yards (yard.travelFeeCents)
   *
   * @param hardValidate - when true, throws BadRequestException on minCars violations;
   *                       when false, populates minCarsViolations[] instead.
   */
  private computeQuote(
    items: CartItemDto[],
    pricing: PortalPricing,
    yardFees: Map<string, YardFeeData>,
    hardValidate: boolean,
  ): InspectionQuote {
    const DEFAULT_TRAVEL_FEE = 5000;
    const DEFAULT_MIN_CARS = 1;

    // Group by yardId.
    const yardMap = new Map<string, YardGroup>();
    for (const item of items) {
      if (!yardMap.has(item.yardId)) {
        yardMap.set(item.yardId, {
          yardId: item.yardId,
          yardName: item.yardName,
          cars: [],
        });
      }
      yardMap.get(item.yardId)!.cars.push(item);
    }

    const minCarsViolations: InspectionQuote['minCarsViolations'] = [];

    const byYard = Array.from(yardMap.values()).map((g) => {
      const fee = yardFees.get(g.yardId);
      const travelFeeCents = fee?.travelFeeCents ?? DEFAULT_TRAVEL_FEE;
      const minCars = fee?.minCars ?? DEFAULT_MIN_CARS;
      const yardName = g.yardName ?? fee?.name ?? g.yardId;
      const actual = g.cars.length;

      if (actual < minCars) {
        minCarsViolations.push({
          yardId: g.yardId,
          yardName,
          required: minCars,
          actual,
        });
      }

      return {
        yardId: g.yardId,
        yardName: g.yardName ?? fee?.name,
        cars: actual,
        travelFeeCents,
        minCars,
      };
    });

    // Hard-block at checkout; soft-warn at quote.
    if (hardValidate && minCarsViolations.length > 0) {
      const msgs = minCarsViolations.map(
        (v) =>
          `${v.yardName} requiere mínimo ${v.required} vehículo${v.required !== 1 ? 's' : ''} para inspección (tienes ${v.actual})`,
      );
      throw new BadRequestException(msgs.join('. '));
    }

    const carsCount = items.length;
    const yardsCount = yardMap.size;
    const inspectionSubtotalCents = carsCount * pricing.inspectionFeeCents;
    const travelSubtotalCents = byYard.reduce(
      (sum, y) => sum + y.travelFeeCents,
      0,
    );
    const totalCents = inspectionSubtotalCents + travelSubtotalCents;

    return {
      items,
      byYard,
      carsCount,
      yardsCount,
      inspectionFeeCents: pricing.inspectionFeeCents,
      travelFeeCents: travelSubtotalCents, // aggregate for legacy compat
      inspectionSubtotalCents,
      travelSubtotalCents,
      totalCents,
      currency: 'usd',
      minCarsViolations,
    };
  }

  // ── Private: Stripe helpers ───────────────────────────────────────────────

  private portalBaseUrl(): string {
    return process.env.PORTAL_BASE_URL ?? 'https://htownautos.com';
  }

  private async getOrCreateStripeCustomer(buyer: PortalBuyer): Promise<string> {
    const fresh = await this.prisma.buyer.findFirst({
      where: { id: buyer.id, tenantId: buyer.tenantId },
      select: { stripeCustomerId: true },
    });

    if (fresh?.stripeCustomerId) return fresh.stripeCustomerId;

    const customer = await this.stripe.customers.create({
      email: buyer.email || undefined,
      name: `${buyer.firstName} ${buyer.lastName}`.trim(),
      phone: buyer.phoneMain || undefined,
      metadata: { buyerId: buyer.id, tenantId: buyer.tenantId },
    });

    await this.prisma.buyer.update({
      where: { id: buyer.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }
}
