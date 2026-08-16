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
var BuyerFavoritesShareLinksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerFavoritesShareLinksService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_1 = require("@htownautos/prisma");
const short_url_service_1 = require("../short-url/short-url.service");
const buyer_favorites_service_1 = require("./buyer-favorites.service");
let BuyerFavoritesShareLinksService = BuyerFavoritesShareLinksService_1 = class BuyerFavoritesShareLinksService {
    prisma;
    shortUrl;
    favoritesService;
    logger = new common_1.Logger(BuyerFavoritesShareLinksService_1.name);
    frontendUrl;
    constructor(prisma, shortUrl, favoritesService) {
        this.prisma = prisma;
        this.shortUrl = shortUrl;
        this.favoritesService = favoritesService;
        this.frontendUrl = (process.env.FRONTEND_URL || 'https://htownautos.com').replace(/\/+$/, '');
    }
    buildLongUrl(token) {
        return `${this.frontendUrl}/favorites/shared?token=${token}`;
    }
    async ensureBuyer(buyerId, tenantId) {
        const buyer = await this.prisma.buyer.findFirst({
            where: { id: buyerId, tenantId: tenantId || undefined },
            select: { firstName: true, lastName: true },
        });
        if (!buyer)
            throw new common_1.NotFoundException(`Buyer ${buyerId} not found`);
        return buyer;
    }
    async resolveLink(token) {
        const link = await this.prisma.buyerFavoritesShareLink.findUnique({
            where: { token },
            include: { buyer: { select: { id: true, firstName: true, lastName: true, tenantId: true } } },
        });
        if (!link || link.revoked)
            throw new common_1.NotFoundException('Favorites link not found');
        if (link.expiresAt && link.expiresAt < new Date()) {
            throw new common_1.NotFoundException('Favorites link has expired');
        }
        return link;
    }
    async create(buyerId, tenantId, userId, dto) {
        await this.ensureBuyer(buyerId, tenantId);
        const expiresAt = dto.expirationHours
            ? new Date(Date.now() + dto.expirationHours * 60 * 60 * 1000)
            : null;
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const link = await this.prisma.buyerFavoritesShareLink.create({
            data: { token, buyerId, tenantId, expiresAt, createdBy: userId },
        });
        let shortUrlCode = null;
        if (tenantId) {
            try {
                const longUrl = this.buildLongUrl(token);
                const res = await this.shortUrl.create(longUrl, tenantId, userId ?? undefined, expiresAt ?? undefined);
                shortUrlCode = res.code;
                await this.prisma.buyerFavoritesShareLink.update({
                    where: { id: link.id },
                    data: { shortUrlCode },
                });
            }
            catch (err) {
                this.logger.warn(`Short URL creation failed for favorites share link ${link.id}: ${err.message}`);
            }
        }
        const url = this.buildLongUrl(token);
        const shortUrl = shortUrlCode ? this.shortUrl.buildShortUrl(shortUrlCode) : null;
        return { token, url, shortUrl, expiresAt };
    }
    async resolvePublic(token) {
        if (!token)
            throw new common_1.NotFoundException('Favorites link not found');
        const link = await this.resolveLink(token);
        const { buyer } = link;
        this.prisma.buyerFavoritesShareLink
            .update({ where: { id: link.id }, data: { lastAccessedAt: new Date() } })
            .catch(() => undefined);
        const items = await this.favoritesService.list(buyer.id, buyer.tenantId ?? null);
        return {
            buyerName: `${buyer.firstName} ${buyer.lastName}`.trim(),
            expiresAt: link.expiresAt,
            items,
        };
    }
    async removePublic(token, lotNumber) {
        if (!token)
            throw new common_1.NotFoundException('Favorites link not found');
        const link = await this.resolveLink(token);
        this.prisma.buyerFavoritesShareLink
            .update({ where: { id: link.id }, data: { lastAccessedAt: new Date() } })
            .catch(() => undefined);
        await this.favoritesService.remove(link.buyerId, lotNumber);
        return { ok: true };
    }
};
exports.BuyerFavoritesShareLinksService = BuyerFavoritesShareLinksService;
exports.BuyerFavoritesShareLinksService = BuyerFavoritesShareLinksService = BuyerFavoritesShareLinksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        short_url_service_1.ShortUrlService,
        buyer_favorites_service_1.BuyerFavoritesService])
], BuyerFavoritesShareLinksService);
//# sourceMappingURL=buyer-favorites-share-links.service.js.map