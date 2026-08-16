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
var InspectionShareLinksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionShareLinksService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const short_url_service_1 = require("../short-url/short-url.service");
const auction_analysis_service_1 = require("../auction-analysis/auction-analysis.service");
const MEDIA_SIGNED_URL_TTL = 60 * 60 * 6;
let InspectionShareLinksService = InspectionShareLinksService_1 = class InspectionShareLinksService {
    prisma;
    s3;
    shortUrl;
    auctionAnalysis;
    logger = new common_1.Logger(InspectionShareLinksService_1.name);
    appBaseUrl;
    constructor(prisma, s3, shortUrl, auctionAnalysis) {
        this.prisma = prisma;
        this.s3 = s3;
        this.shortUrl = shortUrl;
        this.auctionAnalysis = auctionAnalysis;
        this.appBaseUrl = (process.env.APP_BASE_URL || 'https://app.htownautos.com').replace(/\/+$/, '');
    }
    buildLongUrl(vin, token) {
        const qs = new URLSearchParams({ vin, token });
        return `${this.appBaseUrl}/dashboard/inspection/shared?${qs.toString()}`;
    }
    async create(inspectionId, tenantId, userId, dto) {
        const inspection = await this.prisma.vehicleInspection.findFirst({
            where: { id: inspectionId, tenantId: tenantId || undefined },
            select: { id: true, vin: true },
        });
        if (!inspection) {
            throw new common_1.NotFoundException(`Inspection ${inspectionId} not found`);
        }
        const expiresAt = dto.expiresInHours
            ? new Date(Date.now() + dto.expiresInHours * 60 * 60 * 1000)
            : null;
        const token = (0, crypto_1.randomBytes)(32).toString('base64url');
        const link = await this.prisma.inspectionShareLink.create({
            data: {
                token,
                inspectionId,
                expiresAt,
                createdBy: userId,
            },
        });
        let shortUrlCode = null;
        if (tenantId) {
            try {
                const longUrl = this.buildLongUrl(inspection.vin, token);
                const res = await this.shortUrl.create(longUrl, tenantId, userId ?? undefined, expiresAt ?? undefined);
                shortUrlCode = res.code;
                await this.prisma.inspectionShareLink.update({
                    where: { id: link.id },
                    data: { shortUrlCode },
                });
            }
            catch (err) {
                this.logger.warn(`Short URL creation failed for share link ${link.id}: ${err.message}`);
            }
        }
        return {
            ...link,
            shortUrlCode,
            shortUrl: shortUrlCode
                ? this.shortUrl.buildShortUrl(shortUrlCode)
                : null,
        };
    }
    async listForInspection(inspectionId, tenantId) {
        await this.ensureInspection(inspectionId, tenantId);
        const rows = await this.prisma.inspectionShareLink.findMany({
            where: { inspectionId },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => ({
            ...r,
            shortUrl: r.shortUrlCode
                ? this.shortUrl.buildShortUrl(r.shortUrlCode)
                : null,
        }));
    }
    async revoke(linkId, tenantId) {
        const link = await this.prisma.inspectionShareLink.findUnique({
            where: { id: linkId },
            include: {
                inspection: { select: { tenantId: true } },
            },
        });
        if (!link)
            throw new common_1.NotFoundException('Share link not found');
        if (tenantId && link.inspection.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Cannot revoke another tenant share link');
        }
        return this.prisma.inspectionShareLink.update({
            where: { id: linkId },
            data: { revoked: true },
        });
    }
    async remove(linkId, tenantId) {
        const link = await this.prisma.inspectionShareLink.findUnique({
            where: { id: linkId },
            include: { inspection: { select: { tenantId: true } } },
        });
        if (!link)
            throw new common_1.NotFoundException('Share link not found');
        if (tenantId && link.inspection.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Cannot delete another tenant share link');
        }
        await this.prisma.inspectionShareLink.delete({ where: { id: linkId } });
        return { deleted: true };
    }
    async resolvePublic(token, vin) {
        if (!token || !vin)
            throw new common_1.NotFoundException('Inspection not found');
        const link = await this.prisma.inspectionShareLink.findUnique({
            where: { token },
            include: {
                inspection: {
                    include: {
                        checklist: {
                            orderBy: [
                                { sortOrder: 'asc' },
                                { createdAt: 'asc' },
                            ],
                            include: {
                                media: { orderBy: { createdAt: 'asc' } },
                            },
                        },
                        requestItems: {
                            orderBy: [
                                { sortOrder: 'asc' },
                                { createdAt: 'asc' },
                            ],
                            include: {
                                media: { orderBy: { createdAt: 'asc' } },
                            },
                        },
                        errorCodes: {
                            orderBy: [
                                { sortOrder: 'asc' },
                                { createdAt: 'asc' },
                            ],
                            include: {
                                media: { orderBy: { createdAt: 'asc' } },
                            },
                        },
                        media: { orderBy: { createdAt: 'asc' } },
                    },
                },
            },
        });
        if (!link || link.revoked)
            throw new common_1.NotFoundException('Inspection not found');
        if (link.expiresAt && link.expiresAt < new Date()) {
            throw new common_1.NotFoundException('Inspection not found');
        }
        if (link.inspection.vin.toUpperCase().trim() !== vin.toUpperCase().trim()) {
            throw new common_1.NotFoundException('Inspection not found');
        }
        this.prisma.inspectionShareLink
            .update({
            where: { id: link.id },
            data: { lastAccessedAt: new Date() },
        })
            .catch(() => undefined);
        const inspection = link.inspection;
        const allMedia = [
            ...inspection.media,
            ...inspection.checklist.flatMap((c) => c.media),
            ...inspection.requestItems.flatMap((r) => r.media),
            ...inspection.errorCodes.flatMap((e) => e.media),
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
        const carfax = await this.fetchCarfaxForVehicle(inspection.vin, inspection.lotNumber);
        const analysis = await this.auctionAnalysis.gatherForLot(inspection.lotNumber ?? null);
        const vehicle = await this.fetchVehicleFromListing(inspection.lotNumber, inspection.vin);
        return {
            id: inspection.id,
            vin: inspection.vin,
            lotNumber: inspection.lotNumber,
            yardName: inspection.yardName,
            yardNumber: inspection.yardNumber,
            status: inspection.status,
            requestedAt: inspection.requestedAt,
            inspectedAt: inspection.inspectedAt,
            completedAt: inspection.completedAt,
            overallRating: inspection.overallRating,
            notes: inspection.notes,
            media: inspection.media,
            checklist: inspection.checklist,
            requestItems: inspection.requestItems,
            errorCodes: inspection.errorCodes,
            carfax,
            analysis,
            vehicle,
            shareLink: {
                expiresAt: link.expiresAt,
            },
        };
    }
    async ensureInspection(id, tenantId) {
        const exists = await this.prisma.vehicleInspection.findFirst({
            where: { id, tenantId: tenantId || undefined },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException(`Inspection ${id} not found`);
    }
    async fetchVehicleFromListing(lotNumber, vin) {
        const LISTING_SELECT = {
            images: true,
            year: true,
            make: true,
            modelGroup: true,
            modelDetail: true,
            trim: true,
            color: true,
            bodyStyle: true,
            engine: true,
            transmission: true,
            drive: true,
            fuelType: true,
            cylinders: true,
            odometer: true,
            damageDescription: true,
            secondaryDamage: true,
            hasKeys: true,
            runsDrives: true,
            saleTitleType: true,
            saleTitleState: true,
            highBid: true,
            buyItNowPrice: true,
            estRetailValue: true,
            repairCost: true,
            saleStatus: true,
            saleDate: true,
            saleTime: true,
            dayOfWeek: true,
            locationCity: true,
            locationState: true,
            locationZip: true,
            yardName: true,
        };
        try {
            let listing = null;
            if (lotNumber) {
                try {
                    listing = await this.prisma.auctionListing.findFirst({
                        where: { lotNumber: BigInt(lotNumber) },
                        select: LISTING_SELECT,
                    });
                }
                catch {
                }
            }
            if (!listing && vin) {
                listing = await this.prisma.auctionListing.findFirst({
                    where: { vin },
                    select: LISTING_SELECT,
                    orderBy: { createdAt: 'desc' },
                });
            }
            if (!listing)
                return null;
            let images = [];
            if (listing.images) {
                try {
                    const parsed = JSON.parse(listing.images);
                    if (Array.isArray(parsed)) {
                        images = parsed
                            .filter((u) => typeof u === 'string' && u.length > 0)
                            .map((u) => (u.startsWith('//') ? `https:${u}` : u));
                    }
                }
                catch {
                    const raw = listing.images.trim();
                    if (raw.length > 0) {
                        images = [raw.startsWith('//') ? `https:${raw}` : raw];
                    }
                }
            }
            return {
                images,
                year: listing.year,
                make: listing.make,
                model: listing.modelGroup ?? listing.modelDetail ?? null,
                trim: listing.trim,
                color: listing.color,
                bodyType: listing.bodyStyle,
                engine: listing.engine,
                transmission: listing.transmission,
                drivetrain: listing.drive,
                fuelType: listing.fuelType,
                cylinders: listing.cylinders,
                odometer: listing.odometer != null ? listing.odometer.toString() : null,
                primaryDamage: listing.damageDescription,
                secondaryDamage: listing.secondaryDamage,
                hasKeys: listing.hasKeys,
                runsDrives: listing.runsDrives,
                titleType: listing.saleTitleType,
                titleState: listing.saleTitleState,
                highBid: listing.highBid != null ? listing.highBid.toString() : null,
                buyItNow: listing.buyItNowPrice != null ? listing.buyItNowPrice.toString() : null,
                estValue: listing.estRetailValue != null ? listing.estRetailValue.toString() : null,
                repairCost: listing.repairCost != null ? listing.repairCost.toString() : null,
                saleStatus: listing.saleStatus,
                saleDate: listing.saleDate,
                saleTime: listing.saleTime,
                dayOfWeek: listing.dayOfWeek,
                locationCity: listing.locationCity,
                locationState: listing.locationState,
                locationZip: listing.locationZip,
                yardName: listing.yardName,
            };
        }
        catch (err) {
            this.logger.warn(`fetchVehicleFromListing failed for lot=${lotNumber} vin=${vin}: ${err.message}`);
            return null;
        }
    }
    async fetchCarfaxForVehicle(vin, lotNumber) {
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
                r.signedUrl = await this.s3.getSignedUrl(r.s3Key, MEDIA_SIGNED_URL_TTL);
            }
            catch {
            }
        }));
        return reports;
    }
};
exports.InspectionShareLinksService = InspectionShareLinksService;
exports.InspectionShareLinksService = InspectionShareLinksService = InspectionShareLinksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        common_2.S3Service,
        short_url_service_1.ShortUrlService,
        auction_analysis_service_1.AuctionAnalysisService])
], InspectionShareLinksService);
//# sourceMappingURL=inspection-share-links.service.js.map