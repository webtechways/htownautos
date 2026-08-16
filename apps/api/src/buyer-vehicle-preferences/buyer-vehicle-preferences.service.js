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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerVehiclePreferencesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_1 = require("@htownautos/prisma");
const auction_matching_1 = require("@htownautos/auction-matching");
const sale_time_util_1 = require("./sale-time.util");
function serialize(pref) {
    return {
        ...pref,
        maxCost: pref.maxCost?.toString() ?? null,
    };
}
const MATCH_LISTING_SELECT = {
    lotNumber: true,
    year: true,
    make: true,
    modelGroup: true,
    modelDetail: true,
    trim: true,
    vin: true,
    bodyStyle: true,
    color: true,
    odometer: true,
    damageDescription: true,
    secondaryDamage: true,
    saleTitleType: true,
    hasKeys: true,
    runsDrives: true,
    locationCity: true,
    locationState: true,
    saleDate: true,
    dayOfWeek: true,
    saleStatus: true,
    highBid: true,
    buyItNowPrice: true,
    estRetailValue: true,
    repairCost: true,
    images: true,
    itemNumber: true,
    sellerName: true,
};
function serializeListing(l) {
    return {
        ...l,
        lotNumber: l.lotNumber?.toString() ?? null,
        odometer: l.odometer != null ? Number(l.odometer) : null,
        highBid: l.highBid?.toString() ?? null,
        buyItNowPrice: l.buyItNowPrice?.toString() ?? null,
        estRetailValue: l.estRetailValue?.toString() ?? null,
        repairCost: l.repairCost?.toString() ?? null,
        saleDate: l.saleDate != null ? String(l.saleDate) : null,
    };
}
let BuyerVehiclePreferencesService = class BuyerVehiclePreferencesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureBuyer(buyerId, tenantId) {
        const exists = await this.prisma.buyer.findFirst({
            where: { id: buyerId, tenantId: tenantId || undefined },
            select: { id: true },
        });
        if (!exists) {
            throw new common_1.NotFoundException(`Buyer ${buyerId} not found`);
        }
    }
    async list(buyerId, tenantId) {
        await this.ensureBuyer(buyerId, tenantId);
        const rows = await this.prisma.buyerVehiclePreference.findMany({
            where: { buyerId, tenantId: tenantId || undefined },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(serialize);
    }
    async create(buyerId, tenantId, userId, dto) {
        await this.ensureBuyer(buyerId, tenantId);
        const created = await this.prisma.buyerVehiclePreference.create({
            data: {
                buyerId,
                tenantId: tenantId || null,
                createdBy: userId,
                make: dto.make,
                yearFrom: dto.yearFrom ?? null,
                yearTo: dto.yearTo ?? null,
                models: dto.models ?? [],
                trims: dto.trims ?? [],
                maxMileage: dto.maxMileage ?? null,
                titleTypes: dto.titleTypes ?? [],
                colors: dto.colors ?? [],
                maxCost: dto.maxCost != null ? new client_1.Prisma.Decimal(dto.maxCost) : null,
                notes: dto.notes ?? null,
            },
        });
        return serialize(created);
    }
    async update(id, buyerId, tenantId, dto) {
        const existing = await this.prisma.buyerVehiclePreference.findFirst({
            where: { id, buyerId, tenantId: tenantId || undefined },
            select: { id: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Preference ${id} not found`);
        }
        const data = {};
        if (dto.make !== undefined)
            data.make = dto.make;
        if (dto.yearFrom !== undefined)
            data.yearFrom = dto.yearFrom;
        if (dto.yearTo !== undefined)
            data.yearTo = dto.yearTo;
        if (dto.models !== undefined)
            data.models = dto.models;
        if (dto.trims !== undefined)
            data.trims = dto.trims;
        if (dto.maxMileage !== undefined)
            data.maxMileage = dto.maxMileage;
        if (dto.titleTypes !== undefined)
            data.titleTypes = dto.titleTypes;
        if (dto.colors !== undefined)
            data.colors = dto.colors;
        if (dto.maxCost !== undefined) {
            data.maxCost =
                dto.maxCost === null ? null : new client_1.Prisma.Decimal(dto.maxCost);
        }
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        const updated = await this.prisma.buyerVehiclePreference.update({
            where: { id },
            data,
        });
        return serialize(updated);
    }
    async matches(buyerId, tenantId, inspectableOnly = false, trustedSeller = false) {
        await this.ensureBuyer(buyerId, tenantId);
        const prefs = await this.prisma.buyerVehiclePreference.findMany({
            where: { buyerId, tenantId: tenantId || undefined },
        });
        if (prefs.length === 0)
            return [];
        const orClauses = prefs.map(auction_matching_1.preferenceToWhere);
        const today = new Date();
        const todayInt = today.getUTCFullYear() * 10000 +
            (today.getUTCMonth() + 1) * 100 +
            today.getUTCDate();
        const andClauses = [
            { OR: orClauses },
            {
                OR: [
                    { saleDate: null },
                    { saleDate: { gte: todayInt - 1 } },
                ],
            },
        ];
        if (inspectableOnly) {
            andClauses.push({ yard: { is: { physicalInspectionAvailable: true } } });
        }
        if (trustedSeller) {
            andClauses.push({ sellerCategory: { in: ['Insurance', 'Rental', 'Repo'] } });
        }
        const exclusionRows = await this.prisma.buyerMatchExclusion.findMany({
            where: { buyerId },
            select: { lotNumber: true },
        });
        if (exclusionRows.length > 0) {
            andClauses.push({
                lotNumber: { notIn: exclusionRows.map((r) => r.lotNumber) },
            });
        }
        const listings = await this.prisma.auctionListing.findMany({
            where: { AND: andClauses },
            take: 1000,
            orderBy: [
                { saleDate: { sort: 'asc', nulls: 'last' } },
                { itemNumber: { sort: 'asc', nulls: 'last' } },
                { lotNumber: 'asc' },
            ],
            select: {
                ...MATCH_LISTING_SELECT,
                saleTime: true,
                timeZone: true,
            },
        });
        const now = new Date();
        const future = listings.filter((l) => (0, sale_time_util_1.isFutureSale)(l.saleDate, l.saleTime, l.timeZone, now));
        return future.slice(0, 500).map(serializeListing);
    }
    async remove(id, buyerId, tenantId) {
        const existing = await this.prisma.buyerVehiclePreference.findFirst({
            where: { id, buyerId, tenantId: tenantId || undefined },
            select: { id: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Preference ${id} not found`);
        }
        await this.prisma.buyerVehiclePreference.delete({ where: { id } });
        return { deleted: true };
    }
    async addExclusion(buyerId, tenantId, lotNumberStr, createdById) {
        await this.ensureBuyer(buyerId, tenantId);
        const lotNumber = BigInt(lotNumberStr);
        const row = await this.prisma.buyerMatchExclusion.upsert({
            where: { buyerId_lotNumber: { buyerId, lotNumber } },
            create: {
                buyerId,
                tenantId: tenantId || null,
                lotNumber,
                createdById: createdById || null,
            },
            update: {},
        });
        return { ...row, lotNumber: row.lotNumber.toString() };
    }
    async removeExclusion(buyerId, tenantId, lotNumberStr) {
        await this.ensureBuyer(buyerId, tenantId);
        const lotNumber = BigInt(lotNumberStr);
        await this.prisma.buyerMatchExclusion.deleteMany({
            where: { buyerId, lotNumber },
        });
        return { ok: true };
    }
    async resetExclusions(buyerId, tenantId) {
        await this.ensureBuyer(buyerId, tenantId);
        const result = await this.prisma.buyerMatchExclusion.deleteMany({
            where: { buyerId },
        });
        return { removed: result.count };
    }
    async listExclusions(buyerId, tenantId) {
        await this.ensureBuyer(buyerId, tenantId);
        const rows = await this.prisma.buyerMatchExclusion.findMany({
            where: { buyerId },
            orderBy: { createdAt: 'asc' },
            select: { lotNumber: true, createdAt: true },
        });
        return { lotNumbers: rows.map((r) => r.lotNumber.toString()) };
    }
};
exports.BuyerVehiclePreferencesService = BuyerVehiclePreferencesService;
exports.BuyerVehiclePreferencesService = BuyerVehiclePreferencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], BuyerVehiclePreferencesService);
//# sourceMappingURL=buyer-vehicle-preferences.service.js.map