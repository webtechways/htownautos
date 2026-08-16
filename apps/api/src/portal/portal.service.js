"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PortalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const auth_1 = require("@htownautos/auth");
const copart_service_1 = require("../copart/copart.service");
const auction_search_service_1 = require("../opensearch/auction-search.service");
const vehicle_inspections_service_1 = require("../vehicle-inspections/vehicle-inspections.service");
const portal_pricing_service_1 = require("./portal-pricing.service");
const auction_analysis_service_1 = require("../auction-analysis/auction-analysis.service");
const notifications_service_1 = require("../notifications/notifications.service");
const MIN_DEPOSIT_CENTS = 1000;
const FIND_A_CAR_PRICE_CENTS = 50_000;
const PORTAL_MIN_LEAD_HOURS = 48;
function parsePortalAuctionDateTime(saleDate, saleTime) {
    if (!saleDate || saleDate === 0)
        return null;
    const str = saleDate.toString();
    if (str.length !== 8)
        return null;
    const year = Number(str.slice(0, 4));
    const month = Number(str.slice(4, 6)) - 1;
    const day = Number(str.slice(6, 8));
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day))
        return null;
    let hours = 0;
    let minutes = 0;
    if (saleTime) {
        const m = saleTime.match(/^(\d{1,2}):(\d{2})/);
        if (m) {
            hours = Number(m[1]);
            minutes = Number(m[2]);
        }
    }
    return new Date(Date.UTC(year, month, day, hours, minutes));
}
function addPortalBusinessHours(start, hours) {
    let cur = new Date(start);
    const startDay = cur.getUTCDay();
    if (startDay === 6)
        cur = new Date(cur.getTime() + 2 * 86_400_000);
    else if (startDay === 0)
        cur = new Date(cur.getTime() + 1 * 86_400_000);
    let remainingMs = hours * 3_600_000;
    while (remainingMs > 0) {
        const dayEnd = new Date(cur);
        dayEnd.setUTCHours(24, 0, 0, 0);
        const slice = dayEnd.getTime() - cur.getTime();
        if (slice > remainingMs) {
            cur = new Date(cur.getTime() + remainingMs);
            remainingMs = 0;
        }
        else {
            remainingMs -= slice;
            cur = dayEnd;
            const d = cur.getUTCDay();
            if (d === 6)
                cur = new Date(cur.getTime() + 2 * 86_400_000);
            else if (d === 0)
                cur = new Date(cur.getTime() + 1 * 86_400_000);
        }
    }
    return cur;
}
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
};
let PortalService = PortalService_1 = class PortalService {
    prisma;
    copartService;
    inspectionsService;
    pricingService;
    auctionSearchService;
    s3;
    auctionAnalysis;
    notifications;
    logger = new common_1.Logger(PortalService_1.name);
    stripe;
    constructor(prisma, copartService, inspectionsService, pricingService, auctionSearchService, s3, auctionAnalysis, notifications) {
        this.prisma = prisma;
        this.copartService = copartService;
        this.inspectionsService = inspectionsService;
        this.pricingService = pricingService;
        this.auctionSearchService = auctionSearchService;
        this.s3 = s3;
        this.auctionAnalysis = auctionAnalysis;
        this.notifications = notifications;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    }
    async getProfile(buyer) {
        const row = await this.prisma.buyer.findFirst({
            where: { id: buyer.id, tenantId: buyer.tenantId },
            select: BUYER_SAFE_SELECT,
        });
        if (!row)
            throw new common_1.NotFoundException('Buyer profile not found');
        return row;
    }
    async updateProfile(buyer, dto) {
        const data = {};
        if (dto.firstName !== undefined)
            data.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            data.lastName = dto.lastName;
        if (dto.phoneMain !== undefined)
            data.phoneMain = dto.phoneMain;
        if (dto.phoneMobile !== undefined)
            data.phoneMobile = dto.phoneMobile;
        if (dto.phoneSecondary !== undefined)
            data.phoneSecondary = dto.phoneSecondary;
        const updated = await this.prisma.buyer.update({
            where: { id: buyer.id },
            data,
            select: BUYER_SAFE_SELECT,
        });
        return updated;
    }
    async getListings(query) {
        return this.copartService.findAll({ ...query, inspectableOnly: true });
    }
    async getListingByLotNumber(lotNumber) {
        const listing = await this.copartService.findByLotNumber(lotNumber);
        if (!listing) {
            throw new common_1.NotFoundException(`Listing with lot number ${lotNumber} not found`);
        }
        const reports = await this.fetchAndSignCarfax(listing.vin ?? '', lotNumber);
        const carfax = reports.map((r) => ({
            id: r.id,
            aiSummary: r.aiSummary ?? null,
            analysis: r.analysis ?? null,
            signedUrl: r.signedUrl ?? null,
            date: r.date ?? null,
            createdAt: r.createdAt ?? null,
        }));
        return { ...listing, carfax };
    }
    getFilters() {
        return this.copartService.getFilterOptions();
    }
    getPortalFilters(opts) {
        return this.copartService.getPortalFilters(opts);
    }
    async getListingGallery(lotNumber) {
        try {
            return await this.auctionSearchService.getCopartGallery(lotNumber);
        }
        catch (err) {
            if (err?.status === 404 || err?.constructor?.name === 'NotFoundException') {
                return { lotNumber, imageCount: 0, images: [] };
            }
            throw err;
        }
    }
    getPricingForBuyer(buyer) {
        return this.pricingService.getPricing(buyer.tenantId);
    }
    async getInspections(buyer) {
        return this.inspectionsService.list(buyer.tenantId, null, { buyerId: buyer.id });
    }
    async getInspection(id, buyer) {
        const inspection = await this.inspectionsService.get(id, buyer.tenantId, null);
        if (inspection.buyerId !== buyer.id) {
            throw new common_1.NotFoundException(`Inspection ${id} not found`);
        }
        await this.signInspectionMedia(inspection);
        const carfax = await this.fetchAndSignCarfax(inspection.vin, inspection.lotNumber);
        const analysis = await this.auctionAnalysis.gatherForLot(inspection.lotNumber ?? null);
        return { ...inspection, carfax, analysis };
    }
    async signInspectionMedia(inspection) {
        const MEDIA_SIGNED_URL_TTL = 60 * 60 * 6;
        const allMedia = [
            ...(inspection.media ?? []),
            ...((inspection.checklist ?? []).flatMap((c) => c.media ?? [])),
            ...((inspection.requestItems ?? []).flatMap((r) => r.media ?? [])),
            ...((inspection.errorCodes ?? []).flatMap((e) => e.media ?? [])),
        ];
        await Promise.all(allMedia.map(async (m) => {
            if (!m.storageKey)
                return;
            try {
                m.url = await this.s3.getSignedUrl(m.storageKey, MEDIA_SIGNED_URL_TTL);
            }
            catch {
            }
        }));
    }
    async fetchAndSignCarfax(vin, lotNumber) {
        const CARFAX_SIGNED_URL_TTL = 60 * 60 * 6;
        const orClauses = [{ vin }];
        if (lotNumber) {
            try {
                orClauses.push({ auctionListingId: BigInt(lotNumber) });
            }
            catch {
            }
        }
        const reports = await this.prisma.carfaxReport.findMany({
            where: { OR: orClauses },
            orderBy: { createdAt: 'desc' },
        });
        await Promise.all(reports.map(async (r) => {
            if (!r.s3Key)
                return;
            try {
                const isHtml = /\.html?$/i.test(r.s3Key);
                r.signedUrl = await this.s3.getSignedUrl(r.s3Key, CARFAX_SIGNED_URL_TTL, {
                    contentType: isHtml ? 'text/html' : 'application/pdf',
                    disposition: 'inline',
                });
            }
            catch {
            }
        }));
        return reports;
    }
    async addInspectionRequest(id, buyer, text) {
        const inspection = await this.prisma.vehicleInspection.findFirst({
            where: { id, tenantId: buyer.tenantId },
            select: { id: true, buyerId: true, status: true },
        });
        if (!inspection || inspection.buyerId !== buyer.id) {
            throw new common_1.NotFoundException(`Inspection ${id} not found`);
        }
        if (inspection.status !== 'REQUESTED') {
            throw new common_1.BadRequestException('Solo puedes agregar solicitudes mientras la inspección está en estado solicitada');
        }
        const requestItem = await this.prisma.inspectionRequestItem.create({
            data: {
                inspectionId: id,
                note: text,
                sortOrder: 0,
            },
            include: { media: true },
        });
        try {
            const buyerName = `${buyer.firstName} ${buyer.lastName}`.trim();
            await this.notifications.notifyTenantStaff(buyer.tenantId, {
                title: 'Solicitud especial en inspección',
                message: `${buyerName} agregó una solicitud a una inspección`,
                type: 'CUSTOMER_INSPECTION_NOTE',
                entityType: 'VehicleInspection',
                entityId: id,
                actionUrl: `${this.dashboardBaseUrl()}/inspections/${id}`,
                metaValue: {
                    buyerId: buyer.id,
                    buyerName,
                    inspectionId: id,
                    note: text,
                },
            });
        }
        catch {
        }
        return requestItem;
    }
    async cancelInspection(id, buyer, reason) {
        const inspection = await this.prisma.vehicleInspection.findFirst({
            where: { id, tenantId: buyer.tenantId },
            select: { id: true, buyerId: true, status: true },
        });
        if (!inspection || inspection.buyerId !== buyer.id) {
            throw new common_1.NotFoundException(`Inspection ${id} not found`);
        }
        const nonCancellableStatuses = ['CANCELED', 'DONE', 'REJECTED'];
        if (nonCancellableStatuses.includes(inspection.status)) {
            throw new common_1.BadRequestException(`No puedes cancelar una inspección en estado ${inspection.status}`);
        }
        const updated = await this.prisma.vehicleInspection.update({
            where: { id },
            data: {
                status: 'CANCELED',
                cancelledAt: new Date(),
                cancelReason: reason ?? null,
                cancelledByCustomer: true,
            },
        });
        try {
            const buyerName = `${buyer.firstName} ${buyer.lastName}`.trim();
            await this.notifications.notifyTenantStaff(buyer.tenantId, {
                title: 'Inspección cancelada por cliente',
                message: `${buyerName} canceló una inspección`,
                type: 'CUSTOMER_INSPECTION_CANCELLED',
                entityType: 'VehicleInspection',
                entityId: id,
                actionUrl: `${this.dashboardBaseUrl()}/inspections/${id}`,
                metaValue: {
                    buyerId: buyer.id,
                    buyerName,
                    inspectionId: id,
                    reason: reason ?? null,
                },
            });
        }
        catch {
        }
        return updated;
    }
    async confirmOrderBySession(buyer, sessionId) {
        const order = await this.prisma.portalOrder.findFirst({
            where: { stripeCheckoutSessionId: sessionId, buyerId: buyer.id },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status === 'PENDING') {
            try {
                const session = await this.stripe.checkout.sessions.retrieve(sessionId);
                if (session.payment_status === 'paid') {
                    await this.fulfillPortalOrder(session);
                }
            }
            catch (err) {
                this.logger.warn(`confirmOrderBySession ${sessionId}: ${err?.message}`);
            }
        }
        const fresh = (await this.prisma.portalOrder.findUnique({
            where: { id: order.id },
        })) ?? order;
        const meta = fresh.metadata ?? {};
        const breakdown = await this.buildOrderReceiptDetail(fresh);
        return {
            orderId: fresh.id,
            receiptNumber: fresh.id.slice(0, 8).toUpperCase(),
            type: fresh.type,
            status: fresh.status,
            amountCents: Math.round(Number(fresh.amount) * 100),
            currency: fresh.currency,
            description: fresh.description,
            items: meta.items ?? [],
            breakdown,
            createdAt: fresh.createdAt,
        };
    }
    async buildOrderReceiptDetail(order) {
        if (order.type !== 'INSPECTION')
            return null;
        try {
            const DEFAULT_TRAVEL_FEE = 5000;
            const meta = (order.metadata ?? {});
            const items = Array.isArray(meta.items) ? meta.items : [];
            if (items.length === 0)
                return null;
            const quoteByYard = Array.isArray(meta.quote?.byYard) ? meta.quote.byYard : [];
            const travelByYard = new Map();
            for (const y of quoteByYard) {
                if (y?.yardId != null)
                    travelByYard.set(String(y.yardId), y.travelFeeCents ?? DEFAULT_TRAVEL_FEE);
            }
            let inspectionFeeCents = meta.pricing?.inspectionFeeCents;
            if (typeof inspectionFeeCents !== 'number') {
                const pricing = await this.pricingService
                    .getPricing(order.tenantId ?? auth_1.PORTAL_TENANT_ID)
                    .catch(() => null);
                inspectionFeeCents = pricing?.inspectionFeeCents ?? 0;
            }
            const yardIds = Array.from(new Set(items.map((i) => i.yardId).filter(Boolean)));
            const yardRows = yardIds.length
                ? await this.prisma.yard.findMany({
                    where: { id: { in: yardIds } },
                    select: { id: true, name: true, city: true, state: true, travelFeeCents: true },
                })
                : [];
            const yardMap = new Map(yardRows.map((y) => [y.id, y]));
            const lotBigints = [];
            for (const i of items) {
                if (!i.lotNumber)
                    continue;
                try {
                    lotBigints.push(BigInt(i.lotNumber));
                }
                catch {
                }
            }
            const listings = lotBigints.length
                ? await this.prisma.auctionListing.findMany({
                    where: { lotNumber: { in: lotBigints } },
                    select: { lotNumber: true, vin: true, year: true, make: true, modelGroup: true, modelDetail: true },
                })
                : [];
            const composeModel = (mg, md) => [mg, md].filter(Boolean).join(' ') || null;
            const byLot = new Map();
            const byVin = new Map();
            for (const l of listings) {
                const model = composeModel(l.modelGroup, l.modelDetail);
                byLot.set(l.lotNumber.toString(), { year: l.year, make: l.make, model, vin: l.vin });
                if (l.vin)
                    byVin.set(l.vin, { year: l.year, make: l.make, model });
            }
            const fulfilledIds = Array.isArray(meta.fulfilledInspectionIds)
                ? meta.fulfilledInspectionIds
                : [];
            const inspectionRows = fulfilledIds.length
                ? await this.prisma.vehicleInspection.findMany({
                    where: { id: { in: fulfilledIds } },
                    select: { id: true, vin: true, lotNumber: true, yardName: true },
                })
                : [];
            const inspByLot = new Map();
            const inspByVin = new Map();
            for (const r of inspectionRows) {
                if (r.lotNumber)
                    inspByLot.set(r.lotNumber, { id: r.id, yardName: r.yardName });
                if (r.vin)
                    inspByVin.set(r.vin, { id: r.id, yardName: r.yardName });
            }
            const vehInfo = (item) => {
                const fromLot = item.lotNumber ? byLot.get(item.lotNumber) : undefined;
                const fromVin = item.vin ? byVin.get(item.vin) : undefined;
                const src = fromLot ?? fromVin;
                return {
                    year: src?.year ?? null,
                    make: src?.make ?? null,
                    model: src?.model ?? null,
                    vin: item.vin ?? fromLot?.vin ?? null,
                };
            };
            const inspIdFor = (item) => {
                const m = (item.lotNumber && inspByLot.get(item.lotNumber)) ||
                    (item.vin && inspByVin.get(item.vin)) ||
                    null;
                return m ? m.id : null;
            };
            const groups = new Map();
            for (const item of items) {
                const key = item.yardId;
                if (!groups.has(key))
                    groups.set(key, []);
                groups.get(key).push(item);
            }
            const byYard = [];
            let travelSubtotalCents = 0;
            for (const [yardId, cars] of groups) {
                const yard = yardMap.get(yardId);
                const travelFeeCents = travelByYard.get(yardId) ?? yard?.travelFeeCents ?? DEFAULT_TRAVEL_FEE;
                travelSubtotalCents += travelFeeCents;
                const location = yard && (yard.city || yard.state) ? { city: yard.city, state: yard.state } : null;
                byYard.push({
                    yardId,
                    yardName: cars[0]?.yardName ?? yard?.name ?? null,
                    location,
                    cars: cars.length,
                    inspectionFeeCents: inspectionFeeCents,
                    inspectionSubtotalCents: cars.length * inspectionFeeCents,
                    travelFeeCents,
                    vehicles: cars.map((c) => {
                        const v = vehInfo(c);
                        return {
                            inspectionId: inspIdFor(c),
                            lotNumber: c.lotNumber ?? null,
                            vin: v.vin,
                            year: v.year,
                            make: v.make,
                            model: v.model,
                        };
                    }),
                });
            }
            const carsCount = items.length;
            const inspectionSubtotalCents = carsCount * inspectionFeeCents;
            const totalCents = typeof meta.quote?.totalCents === 'number'
                ? meta.quote.totalCents
                : Math.round(Number(order.amount) * 100);
            const inspections = inspectionRows.map((r) => {
                const src = (r.lotNumber && byLot.get(r.lotNumber)) ||
                    (r.vin && byVin.get(r.vin)) ||
                    null;
                return {
                    id: r.id,
                    vin: r.vin,
                    lotNumber: r.lotNumber,
                    year: src?.year ?? null,
                    make: src?.make ?? null,
                    model: src?.model ?? null,
                    yardName: r.yardName,
                };
            });
            return {
                id: order.id,
                type: 'INSPECTION',
                receiptNumber: order.id.slice(0, 8).toUpperCase(),
                status: order.status,
                description: order.description,
                totalCents,
                carsCount,
                yardsCount: groups.size,
                inspectionSubtotalCents,
                travelSubtotalCents,
                inspectionFeeCents: inspectionFeeCents,
                byYard,
                inspections,
            };
        }
        catch (err) {
            this.logger.warn(`buildOrderReceiptDetail: failed for order ${order.id} — ${err.message}`);
            return null;
        }
    }
    async quoteInspections(buyer, dto) {
        const pricing = await this.pricingService.getPricing(buyer.tenantId);
        const yardFees = await this.resolveYardFees(dto.items);
        return this.computeQuote(dto.items, pricing, yardFees, false);
    }
    async quotePublic(dto) {
        const pricing = await this.pricingService.getPricing(auth_1.PORTAL_TENANT_ID);
        const yardFees = await this.resolveYardFees(dto.items);
        return this.computeQuote(dto.items, pricing, yardFees, false);
    }
    async checkoutInspections(buyer, dto) {
        const pricing = await this.pricingService.getPricing(buyer.tenantId);
        const yardFees = await this.resolveYardFees(dto.items);
        const quote = this.computeQuote(dto.items, pricing, yardFees, true);
        const cutoff = addPortalBusinessHours(new Date(), PORTAL_MIN_LEAD_HOURS);
        for (const item of dto.items) {
            let lotKey;
            try {
                lotKey = BigInt(item.lotNumber);
            }
            catch {
                continue;
            }
            const listing = await this.prisma.auctionListing.findUnique({
                where: { lotNumber: lotKey },
                select: { saleDate: true, saleTime: true },
            });
            if (!listing)
                continue;
            const auctionAt = parsePortalAuctionDateTime(listing.saleDate, listing.saleTime);
            if (auctionAt && auctionAt < cutoff) {
                throw new common_1.BadRequestException(`El lote ${item.lotNumber} subasta pronto: se requieren al menos 48 horas hábiles para inspeccionar.`);
            }
        }
        const description = `Vehicle inspections — ${quote.carsCount} car${quote.carsCount !== 1 ? 's' : ''}, ${quote.yardsCount} yard${quote.yardsCount !== 1 ? 's' : ''}`;
        const order = await this.prisma.portalOrder.create({
            data: {
                tenantId: buyer.tenantId,
                buyerId: buyer.id,
                type: 'INSPECTION',
                status: 'PENDING',
                amount: new client_1.Prisma.Decimal(quote.totalCents / 100),
                currency: 'usd',
                description,
                metadata: JSON.parse(JSON.stringify({
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
                })),
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
                        unit_amount: quote.totalCents,
                        product_data: {
                            name: `Vehicle Inspections (${quote.carsCount} car${quote.carsCount !== 1 ? 's' : ''}, ${quote.yardsCount} yard${quote.yardsCount !== 1 ? 's' : ''})`,
                            description: quote.byYard
                                .map((y) => `${y.yardName ?? y.yardId}: ${y.cars} car${y.cars !== 1 ? 's' : ''}`)
                                .join(' | '),
                        },
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                description,
                setup_future_usage: 'off_session',
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
        await this.prisma.portalOrder.update({
            where: { id: order.id },
            data: { stripeCheckoutSessionId: session.id },
        });
        this.logger.log(`Portal inspection order ${order.id} created (${quote.carsCount} cars, ${quote.yardsCount} yards, $${(quote.totalCents / 100).toFixed(2)}) — Stripe session ${session.id}`);
        return {
            orderId: order.id,
            url: session.url,
            checkoutUrl: session.url,
            totalCents: quote.totalCents,
            currency: 'usd',
            breakdown: quote,
        };
    }
    async getLedger(buyer) {
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
            if (e.status !== 'COMPLETED')
                continue;
            const cents = Math.round(Number(e.amount) * 100);
            if (e.type === 'DEPOSIT' || e.type === 'REFUND') {
                balanceCents += cents;
            }
            else if (e.type === 'CHARGE' || e.type === 'APPLIED') {
                balanceCents -= cents;
            }
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
    async createDeposit(buyer, dto) {
        if (dto.amountCents < MIN_DEPOSIT_CENTS) {
            throw new Error(`Minimum deposit is $${(MIN_DEPOSIT_CENTS / 100).toFixed(2)}`);
        }
        const order = await this.prisma.portalOrder.create({
            data: {
                tenantId: buyer.tenantId,
                buyerId: buyer.id,
                type: 'DEPOSIT',
                status: 'PENDING',
                amount: new client_1.Prisma.Decimal(dto.amountCents / 100),
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
                setup_future_usage: 'off_session',
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
        this.logger.log(`Portal deposit order ${order.id} created — Stripe session ${session.id}`);
        return {
            orderId: order.id,
            url: session.url,
            checkoutUrl: session.url,
            amountCents: dto.amountCents,
        };
    }
    async checkoutFindACar(buyer, dto) {
        if (!dto.acceptedTerms) {
            throw new common_1.BadRequestException('Debes aceptar los términos y condiciones');
        }
        if (!dto.preferences?.length) {
            throw new common_1.BadRequestException('Debes especificar al menos una preferencia de vehículo');
        }
        const order = await this.prisma.portalOrder.create({
            data: {
                tenantId: buyer.tenantId,
                buyerId: buyer.id,
                type: 'SERVICE',
                status: 'PENDING',
                amount: new client_1.Prisma.Decimal(FIND_A_CAR_PRICE_CENTS / 100),
                currency: 'usd',
                description: `Find a Car for Me — ${dto.preferences.length} vehículo(s)`,
                metadata: JSON.parse(JSON.stringify({
                    service: 'find-a-car',
                    preferences: dto.preferences,
                    acceptedTerms: true,
                })),
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
                        unit_amount: FIND_A_CAR_PRICE_CENTS,
                        product_data: {
                            name: 'Find a Car for Me',
                            description: 'Inspección onsite de 6 vehículos + Carfax + búsqueda de historial + puja hasta ganar + tramitación de envío. No incluye fee de Copart, brokeraje ni envío.',
                        },
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                description: 'Find a Car for Me service',
                setup_future_usage: 'off_session',
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
                orderType: 'SERVICE',
            },
            success_url: `${this.portalBaseUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${this.portalBaseUrl()}/payment/canceled?session_id={CHECKOUT_SESSION_ID}`,
        });
        await this.prisma.portalOrder.update({
            where: { id: order.id },
            data: { stripeCheckoutSessionId: session.id },
        });
        this.logger.log(`Find-a-Car order ${order.id} created — Stripe session ${session.id}`);
        return {
            orderId: order.id,
            url: session.url,
            checkoutUrl: session.url,
        };
    }
    async fulfillPortalOrder(session) {
        const portalOrderId = session.metadata?.portalOrderId;
        if (!portalOrderId)
            return;
        const order = await this.prisma.portalOrder.findUnique({
            where: { id: portalOrderId },
        });
        if (!order) {
            this.logger.warn(`fulfillPortalOrder: PortalOrder ${portalOrderId} not found`);
            return;
        }
        if (order.status === 'PAID' || order.status === 'FULFILLED') {
            this.logger.log(`fulfillPortalOrder: order ${portalOrderId} already ${order.status} — skipping`);
            return;
        }
        const piId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null;
        await this.prisma.portalOrder.update({
            where: { id: order.id },
            data: {
                status: 'PAID',
                stripePaymentIntentId: piId ?? undefined,
            },
        });
        if (order.type === 'INSPECTION') {
            await this.fulfillInspectionOrder(order, piId);
        }
        else if (order.type === 'DEPOSIT') {
            await this.fulfillDepositOrder(order, piId);
        }
        else if (order.type === 'SERVICE') {
            await this.fulfillFindACarOrder(order, piId);
        }
    }
    async fulfillInspectionOrder(order, piId) {
        const meta = (order.metadata ?? {});
        const tenantId = order.tenantId ?? '';
        let items;
        const rawItems = meta['items'];
        if (Array.isArray(rawItems) && rawItems.length > 0) {
            items = rawItems;
        }
        else {
            const vin = meta['vin'] ?? '';
            if (!vin) {
                this.logger.error(`fulfillInspectionOrder: PortalOrder ${order.id} has no VIN and no items in metadata`);
                return;
            }
            items = [
                {
                    lotNumber: meta['lotNumber'] ?? '',
                    vin,
                    yardId: meta['yardNumber'] ?? '',
                    yardName: meta['yardName'] ?? undefined,
                },
            ];
        }
        const createdIds = [];
        for (const item of items) {
            try {
                const inspection = await this.inspectionsService.create(tenantId, null, {
                    vin: item.vin ?? item.lotNumber,
                    lotNumber: item.lotNumber || undefined,
                    yardId: item.yardId || undefined,
                    yardName: item.yardName || undefined,
                    buyerId: order.buyerId,
                    status: 'REQUESTED',
                });
                createdIds.push(inspection.id);
                this.logger.log(`fulfillInspectionOrder: created inspection ${inspection.id} for lot ${item.lotNumber} (order ${order.id})`);
            }
            catch (err) {
                this.logger.error(`fulfillInspectionOrder: failed to create inspection for lot ${item.lotNumber} (order ${order.id}): ${err.message}`);
            }
        }
        const updatedMetadata = {
            ...meta,
            fulfilledInspectionIds: createdIds,
        };
        await this.prisma.portalOrder.update({
            where: { id: order.id },
            data: {
                status: 'FULFILLED',
                ...(createdIds.length > 0 && {
                    relatedInspectionId: createdIds[0],
                }),
                metadata: updatedMetadata,
            },
        });
        this.logger.log(`fulfillInspectionOrder: order ${order.id} FULFILLED — ${createdIds.length}/${items.length} inspections created`);
        if (createdIds.length > 0) {
            try {
                const buyer = await this.prisma.buyer.findUnique({
                    where: { id: order.buyerId },
                    select: { firstName: true, lastName: true },
                });
                const buyerName = buyer
                    ? `${buyer.firstName} ${buyer.lastName}`.trim()
                    : order.buyerId;
                const count = createdIds.length;
                const lotNumbers = items.map((i) => i.lotNumber).filter(Boolean).join(', ');
                await this.notifications.notifyTenantStaff(tenantId, {
                    title: 'Nueva solicitud de inspección',
                    message: `${buyerName} solicitó ${count} inspección${count !== 1 ? 'es' : ''}${lotNumbers ? ` (${lotNumbers})` : ''}`,
                    type: 'CUSTOMER_INSPECTION_REQUESTED',
                    entityType: 'PortalOrder',
                    entityId: order.id,
                    actionUrl: `${this.dashboardBaseUrl()}/inspections`,
                    metaValue: {
                        buyerId: order.buyerId,
                        buyerName,
                        count,
                        lotNumbers: items.map((i) => i.lotNumber).filter(Boolean),
                        vins: items.map((i) => i.vin).filter(Boolean),
                        orderId: order.id,
                    },
                });
            }
            catch {
            }
        }
    }
    async fulfillDepositOrder(order, piId) {
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
        this.logger.log(`fulfillDepositOrder: order ${order.id} fulfilled — ledger entry created`);
        try {
            const buyer = await this.prisma.buyer.findUnique({
                where: { id: order.buyerId },
                select: { firstName: true, lastName: true },
            });
            const buyerName = buyer
                ? `${buyer.firstName} ${buyer.lastName}`.trim()
                : order.buyerId;
            const tenantId = order.tenantId ?? '';
            const amountDollars = Number(order.amount).toFixed(2);
            await this.notifications.notifyTenantStaff(tenantId, {
                title: 'Depósito recibido',
                message: `${buyerName} realizó un depósito de $${amountDollars}`,
                type: 'CUSTOMER_DEPOSIT',
                entityType: 'PortalOrder',
                entityId: order.id,
                actionUrl: `${this.dashboardBaseUrl()}/buyers/${order.buyerId}`,
                metaValue: {
                    buyerId: order.buyerId,
                    buyerName,
                    amountDollars,
                    currency: order.currency,
                    orderId: order.id,
                },
            });
        }
        catch {
        }
    }
    async fulfillFindACarOrder(order, _piId) {
        const meta = (order.metadata ?? {});
        if (meta['service'] !== 'find-a-car') {
            await this.prisma.portalOrder.update({
                where: { id: order.id },
                data: { status: 'FULFILLED' },
            });
            this.logger.warn(`fulfillFindACarOrder: order ${order.id} has unknown service type "${String(meta['service'])}" — marked FULFILLED without side effects`);
            return;
        }
        const preferences = Array.isArray(meta['preferences'])
            ? meta['preferences']
            : [];
        const createdPreferenceIds = [];
        const vehicleSummaries = [];
        for (const pref of preferences) {
            try {
                const yf = pref['yearFrom'] != null ? Number(pref['yearFrom']) : null;
                const yt = pref['yearTo'] != null ? Number(pref['yearTo']) : null;
                const mk = String(pref['make'] ?? '').trim();
                const mdl = Array.isArray(pref['models']) ? pref['models'] : [];
                const yearPart = yf && yt ? `${yf}-${yt} ` : yf ? `${yf}+ ` : '';
                const modelPart = mdl.length
                    ? ` ${mdl.slice(0, 2).join(', ')}${mdl.length > 2 ? ` +${mdl.length - 2}` : ''}`
                    : '';
                const summary = `${yearPart}${mk}${modelPart}`.trim();
                const created = await this.prisma.buyerVehiclePreference.create({
                    data: {
                        buyerId: order.buyerId,
                        tenantId: order.tenantId,
                        make: String(pref['make'] ?? ''),
                        yearFrom: pref['yearFrom'] != null ? Number(pref['yearFrom']) : null,
                        yearTo: pref['yearTo'] != null ? Number(pref['yearTo']) : null,
                        models: Array.isArray(pref['models']) ? pref['models'] : [],
                        trims: Array.isArray(pref['trims']) ? pref['trims'] : [],
                        maxMileage: pref['maxMileage'] != null ? Number(pref['maxMileage']) : null,
                        titleTypes: Array.isArray(pref['titleTypes']) ? pref['titleTypes'] : [],
                        colors: Array.isArray(pref['colors']) ? pref['colors'] : [],
                        maxCost: pref['maxCost'] != null ? new client_1.Prisma.Decimal(Number(pref['maxCost'])) : null,
                        notes: pref['notes'] != null ? String(pref['notes']) : null,
                        paid: true,
                        paidAt: new Date(),
                        source: 'web-find-a-car',
                        portalOrderId: order.id,
                    },
                });
                createdPreferenceIds.push(created.id);
                if (summary)
                    vehicleSummaries.push(summary);
                this.logger.log(`fulfillFindACarOrder: created BuyerVehiclePreference ${created.id} for order ${order.id}`);
            }
            catch (err) {
                this.logger.error(`fulfillFindACarOrder: failed to create preference for order ${order.id}: ${err.message}`);
            }
        }
        await this.prisma.portalOrder.update({
            where: { id: order.id },
            data: {
                status: 'FULFILLED',
                metadata: {
                    ...meta,
                    createdPreferenceIds,
                },
            },
        });
        this.logger.log(`fulfillFindACarOrder: order ${order.id} FULFILLED — ${createdPreferenceIds.length}/${preferences.length} preferences created`);
        try {
            const tenantId = order.tenantId ?? '';
            const buyer = await this.prisma.buyer.findUnique({
                where: { id: order.buyerId },
                select: { firstName: true, lastName: true },
            });
            const buyerName = buyer
                ? `${buyer.firstName} ${buyer.lastName}`.trim()
                : order.buyerId;
            const vehiclesCount = createdPreferenceIds.length;
            await this.notifications.notifyTenantStaff(tenantId, {
                title: 'Solicitud Find a Car for Me',
                message: `${buyerName} solicitó Find a Car for Me (${vehiclesCount} ${vehiclesCount === 1 ? 'vehículo' : 'vehículos'})`,
                type: 'CUSTOMER_FIND_A_CAR',
                entityType: 'PortalOrder',
                entityId: order.id,
                actionUrl: `/dashboard/customers/${order.buyerId}/edit#for-bids-wanted`,
                metaValue: {
                    buyerId: order.buyerId,
                    buyerName,
                    preferencesCount: vehiclesCount,
                    vehicles: vehicleSummaries,
                    orderId: order.id,
                },
            });
        }
        catch {
        }
    }
    async resolveYardFees(items) {
        const yardIds = Array.from(new Set(items.map((i) => i.yardId)));
        const rows = await this.prisma.yard.findMany({
            where: { id: { in: yardIds } },
            select: { id: true, name: true, travelFeeCents: true, minCars: true },
        });
        const map = new Map();
        for (const r of rows) {
            map.set(r.id, {
                travelFeeCents: r.travelFeeCents,
                minCars: r.minCars,
                name: r.name,
            });
        }
        return map;
    }
    computeQuote(items, pricing, yardFees, hardValidate) {
        const DEFAULT_TRAVEL_FEE = 5000;
        const DEFAULT_MIN_CARS = 1;
        const yardMap = new Map();
        for (const item of items) {
            if (!yardMap.has(item.yardId)) {
                yardMap.set(item.yardId, {
                    yardId: item.yardId,
                    yardName: item.yardName,
                    cars: [],
                });
            }
            yardMap.get(item.yardId).cars.push(item);
        }
        const minCarsViolations = [];
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
        if (hardValidate && minCarsViolations.length > 0) {
            const msgs = minCarsViolations.map((v) => `${v.yardName} requiere mínimo ${v.required} vehículo${v.required !== 1 ? 's' : ''} para inspección (tienes ${v.actual})`);
            throw new common_1.BadRequestException(msgs.join('. '));
        }
        const carsCount = items.length;
        const yardsCount = yardMap.size;
        const inspectionSubtotalCents = carsCount * pricing.inspectionFeeCents;
        const travelSubtotalCents = byYard.reduce((sum, y) => sum + y.travelFeeCents, 0);
        const totalCents = inspectionSubtotalCents + travelSubtotalCents;
        return {
            items,
            byYard,
            carsCount,
            yardsCount,
            inspectionFeeCents: pricing.inspectionFeeCents,
            travelFeeCents: travelSubtotalCents,
            inspectionSubtotalCents,
            travelSubtotalCents,
            totalCents,
            currency: 'usd',
            minCarsViolations,
        };
    }
    async createDepositReleaseRequest(buyer, note) {
        const { balanceCents } = await this.getLedger(buyer);
        if (balanceCents <= 0) {
            throw new common_1.BadRequestException('No tienes saldo disponible para liberar');
        }
        const existing = await this.prisma.depositReleaseRequest.findFirst({
            where: { buyerId: buyer.id, tenantId: buyer.tenantId, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });
        if (existing) {
            return { ...existing, amount: existing.amount.toString() };
        }
        const created = await this.prisma.depositReleaseRequest.create({
            data: {
                tenantId: buyer.tenantId,
                buyerId: buyer.id,
                amount: new client_1.Prisma.Decimal(balanceCents / 100),
                currency: 'usd',
                status: 'PENDING',
                note,
            },
        });
        try {
            const buyerName = `${buyer.firstName} ${buyer.lastName}`.trim();
            await this.notifications.notifyTenantStaff(buyer.tenantId, {
                title: 'Solicitud de liberación de depósito',
                message: `${buyerName} solicitó la liberación de su depósito`,
                type: 'CUSTOMER_DEPOSIT_RELEASE',
                entityType: 'DepositReleaseRequest',
                entityId: created.id,
                actionUrl: `${this.dashboardBaseUrl()}/buyers/${buyer.id}`,
                metaValue: {
                    buyerId: buyer.id,
                    buyerName,
                    amountDollars: created.amount.toString(),
                    requestId: created.id,
                },
            });
        }
        catch {
        }
        return { ...created, amount: created.amount.toString() };
    }
    async getLatestDepositReleaseRequest(buyer) {
        const req = await this.prisma.depositReleaseRequest.findFirst({
            where: { buyerId: buyer.id, tenantId: buyer.tenantId },
            orderBy: { createdAt: 'desc' },
        });
        if (!req)
            return null;
        return { ...req, amount: req.amount.toString() };
    }
    async submitContactForm(data) {
        let tenantId = auth_1.PORTAL_TENANT_ID;
        if (data.tenantSlug) {
            const tenant = await this.prisma.tenant.findFirst({
                where: { slug: data.tenantSlug },
                select: { id: true },
            });
            if (tenant)
                tenantId = tenant.id;
        }
        const contactMessage = await this.prisma.contactMessage.create({
            data: {
                tenantId,
                buyerId: data.buyerId ?? null,
                name: data.name,
                email: data.email,
                phone: data.phone ?? null,
                subject: data.subject ?? null,
                message: data.message,
                status: 'NEW',
            },
        });
        try {
            await this.notifications.notifyTenantStaff(tenantId, {
                title: 'Nuevo mensaje de contacto',
                message: `Nuevo mensaje de contacto de ${data.name}`,
                type: 'CUSTOMER_CONTACT_MESSAGE',
                entityType: 'ContactMessage',
                entityId: contactMessage.id,
                actionUrl: `${this.dashboardBaseUrl()}/contact-messages`,
                metaValue: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone ?? null,
                    subject: data.subject ?? null,
                    message: data.message,
                    contactMessageId: contactMessage.id,
                },
            });
        }
        catch {
        }
        return { ok: true };
    }
    async getOrderForBuyer(orderId, buyer) {
        const order = await this.prisma.portalOrder.findFirst({
            where: { id: orderId, buyerId: buyer.id, tenantId: buyer.tenantId },
        });
        if (!order)
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        return order;
    }
    portalBaseUrl() {
        return process.env.PORTAL_BASE_URL ?? 'https://htownautos.com';
    }
    dashboardBaseUrl() {
        return process.env.DASHBOARD_BASE_URL ?? 'https://app.htownautos.com';
    }
    async getOrCreateStripeCustomer(buyer) {
        const fresh = await this.prisma.buyer.findFirst({
            where: { id: buyer.id, tenantId: buyer.tenantId },
            select: { stripeCustomerId: true },
        });
        if (fresh?.stripeCustomerId)
            return fresh.stripeCustomerId;
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
};
exports.PortalService = PortalService;
exports.PortalService = PortalService = PortalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        copart_service_1.CopartService,
        vehicle_inspections_service_1.VehicleInspectionsService,
        portal_pricing_service_1.PortalPricingService,
        auction_search_service_1.AuctionSearchService,
        common_2.S3Service,
        auction_analysis_service_1.AuctionAnalysisService,
        notifications_service_1.NotificationsService])
], PortalService);
//# sourceMappingURL=portal.service.js.map