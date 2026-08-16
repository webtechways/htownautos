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
exports.BuyerFavoritesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let BuyerFavoritesService = class BuyerFavoritesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    serializeListing(listing) {
        const { yard, ...rest } = listing;
        return {
            ...rest,
            lotNumber: listing.lotNumber.toString(),
            inspectable: yard?.physicalInspectionAvailable ?? false,
        };
    }
    async add(buyerId, tenantId, opts) {
        let lotNumber;
        if (opts.lotNumber && opts.lotNumber.trim()) {
            try {
                lotNumber = BigInt(opts.lotNumber.trim());
            }
            catch {
                throw new common_1.BadRequestException(`Invalid lot number "${opts.lotNumber}"`);
            }
            const listing = await this.prisma.auctionListing.findUnique({
                where: { lotNumber },
                select: { lotNumber: true },
            });
            if (!listing) {
                throw new common_1.NotFoundException(`Auction listing with lot ${opts.lotNumber} not found`);
            }
        }
        else if (opts.vin && opts.vin.trim()) {
            const vin = opts.vin.trim().toUpperCase();
            const listing = await this.prisma.auctionListing.findFirst({
                where: { vin },
                orderBy: { saleDate: 'desc' },
                select: { lotNumber: true },
            });
            if (!listing) {
                throw new common_1.NotFoundException(`No auction listing found for VIN ${vin}`);
            }
            lotNumber = listing.lotNumber;
        }
        else {
            throw new common_1.BadRequestException('Provide a lotNumber or a vin');
        }
        const favorite = await this.prisma.buyerFavorite.upsert({
            where: { buyerId_lotNumber: { buyerId, lotNumber } },
            update: {},
            create: { buyerId, tenantId, lotNumber },
        });
        return { id: favorite.id, lotNumber: lotNumber.toString(), added: true };
    }
    async remove(buyerId, lotNumberStr) {
        const lotNumber = BigInt(lotNumberStr);
        await this.prisma.buyerFavorite.deleteMany({
            where: { buyerId, lotNumber },
        });
        return { lotNumber: lotNumberStr, removed: true };
    }
    async getIds(buyerId) {
        const rows = await this.prisma.buyerFavorite.findMany({
            where: { buyerId },
            select: { lotNumber: true },
        });
        return rows.map((r) => r.lotNumber.toString());
    }
    async list(buyerId, tenantId) {
        const favorites = await this.prisma.buyerFavorite.findMany({
            where: {
                buyerId,
                ...(tenantId ? { tenantId } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
        if (favorites.length === 0)
            return [];
        const lotNumbers = favorites.map((f) => f.lotNumber);
        const listings = await this.prisma.auctionListing.findMany({
            where: { lotNumber: { in: lotNumbers } },
            include: { yard: { select: { physicalInspectionAvailable: true } } },
        });
        const byLot = new Map(listings.map((l) => [l.lotNumber.toString(), this.serializeListing(l)]));
        return favorites.map((f) => ({
            id: f.id,
            lotNumber: f.lotNumber.toString(),
            createdAt: f.createdAt,
            listing: byLot.get(f.lotNumber.toString()) ?? null,
        }));
    }
};
exports.BuyerFavoritesService = BuyerFavoritesService;
exports.BuyerFavoritesService = BuyerFavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], BuyerFavoritesService);
//# sourceMappingURL=buyer-favorites.service.js.map