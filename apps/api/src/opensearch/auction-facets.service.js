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
exports.AuctionFacetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let AuctionFacetsService = class AuctionFacetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async makes(params) {
        const { yearFrom, yearTo } = params;
        const rows = await this.prisma.auctionListing.findMany({
            select: { make: true },
            distinct: ['make'],
            where: {
                make: { not: null },
                isStale: false,
                ...yearRangeClause(yearFrom, yearTo),
            },
            orderBy: { make: 'asc' },
            take: 1000,
        });
        return rows.map((r) => r.make).filter(Boolean);
    }
    async models(params) {
        const { make, yearFrom, yearTo } = params;
        if (!make)
            return [];
        const rows = await this.prisma.auctionListing.findMany({
            select: { modelGroup: true },
            distinct: ['modelGroup'],
            where: {
                make: { equals: make, mode: 'insensitive' },
                modelGroup: { not: null },
                isStale: false,
                ...yearRangeClause(yearFrom, yearTo),
            },
            orderBy: { modelGroup: 'asc' },
            take: 1000,
        });
        return rows.map((r) => r.modelGroup).filter(Boolean);
    }
    async trims(params) {
        const { make, models, yearFrom, yearTo } = params;
        if (!make || models.length === 0)
            return [];
        const rows = await this.prisma.auctionListing.findMany({
            select: { trim: true },
            distinct: ['trim'],
            where: {
                make: { equals: make, mode: 'insensitive' },
                modelGroup: { in: models, mode: 'insensitive' },
                trim: { not: null },
                isStale: false,
                ...yearRangeClause(yearFrom, yearTo),
            },
            orderBy: { trim: 'asc' },
            take: 2000,
        });
        return rows.map((r) => r.trim).filter(Boolean);
    }
    async colors() {
        const rows = await this.prisma.auctionListing.findMany({
            select: { color: true },
            distinct: ['color'],
            where: { color: { not: null }, isStale: false },
            orderBy: { color: 'asc' },
            take: 500,
        });
        return rows.map((r) => r.color).filter(Boolean);
    }
    async titleTypes() {
        const rows = await this.prisma.auctionListing.findMany({
            select: { saleTitleType: true },
            distinct: ['saleTitleType'],
            where: { saleTitleType: { not: null }, isStale: false },
            orderBy: { saleTitleType: 'asc' },
            take: 200,
        });
        return rows.map((r) => r.saleTitleType).filter(Boolean);
    }
    async yearBounds() {
        const agg = await this.prisma.auctionListing.aggregate({
            _min: { year: true },
            _max: { year: true },
            where: { year: { not: null }, isStale: false },
        });
        return { min: agg._min.year ?? null, max: agg._max.year ?? null };
    }
};
exports.AuctionFacetsService = AuctionFacetsService;
exports.AuctionFacetsService = AuctionFacetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], AuctionFacetsService);
function yearRangeClause(yearFrom, yearTo) {
    if (!yearFrom && !yearTo)
        return {};
    const year = {};
    if (yearFrom)
        year.gte = yearFrom;
    if (yearTo)
        year.lte = yearTo;
    return { year };
}
//# sourceMappingURL=auction-facets.service.js.map