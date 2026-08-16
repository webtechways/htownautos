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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const toggle_favorite_dto_1 = require("./dto/toggle-favorite.dto");
let FavoritesService = class FavoritesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async addFavorite(tenantId, userId, listingId, type) {
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        if (type === toggle_favorite_dto_1.FavoriteType.COPART) {
            const listing = await this.prisma.auctionListing.findUnique({
                where: { lotNumber: BigInt(listingId) },
                select: { lotNumber: true },
            });
            if (!listing) {
                throw new common_1.NotFoundException(`Auction listing with ID ${listingId} not found`);
            }
            const favorite = await this.prisma.auctionFavorite.upsert({
                where: {
                    tenantId_userId_lotNumber: {
                        tenantId,
                        userId,
                        lotNumber: listing.lotNumber,
                    },
                },
                update: {},
                create: {
                    tenantId,
                    userId,
                    lotNumber: listing.lotNumber,
                },
            });
            return { id: favorite.id, type, listingId, added: true };
        }
        throw new common_1.BadRequestException(`Invalid favorite type: ${type}`);
    }
    async removeFavorite(tenantId, userId, listingId, type) {
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        if (type === toggle_favorite_dto_1.FavoriteType.COPART) {
            const listing = await this.prisma.auctionListing.findUnique({
                where: { lotNumber: BigInt(listingId) },
                select: { lotNumber: true },
            });
            if (listing) {
                await this.prisma.auctionFavorite.deleteMany({
                    where: {
                        tenantId,
                        userId,
                        lotNumber: listing.lotNumber,
                    },
                });
            }
            return { type, listingId, removed: true };
        }
        throw new common_1.BadRequestException(`Invalid favorite type: ${type}`);
    }
    async getFavoriteIds(tenantId, userId, type) {
        if (!tenantId) {
            return [];
        }
        if (type === toggle_favorite_dto_1.FavoriteType.COPART) {
            const favorites = await this.prisma.auctionFavorite.findMany({
                where: { tenantId, userId },
                select: { lotNumber: true },
            });
            if (favorites.length === 0)
                return [];
            const lotNumbers = favorites.map((f) => f.lotNumber);
            const listings = await this.prisma.auctionListing.findMany({
                where: { lotNumber: { in: lotNumbers } },
                select: { lotNumber: true },
            });
            return listings.map((l) => l.lotNumber.toString());
        }
        return [];
    }
    async isFavorite(tenantId, userId, listingId, type) {
        if (!tenantId) {
            return false;
        }
        if (type === toggle_favorite_dto_1.FavoriteType.COPART) {
            const listing = await this.prisma.auctionListing.findUnique({
                where: { lotNumber: BigInt(listingId) },
                select: { lotNumber: true },
            });
            if (!listing)
                return false;
            const favorite = await this.prisma.auctionFavorite.findUnique({
                where: {
                    tenantId_userId_lotNumber: {
                        tenantId,
                        userId,
                        lotNumber: listing.lotNumber,
                    },
                },
            });
            return !!favorite;
        }
        return false;
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map