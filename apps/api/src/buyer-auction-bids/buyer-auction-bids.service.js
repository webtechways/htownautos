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
exports.BuyerAuctionBidsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_1 = require("@htownautos/prisma");
const LISTING_SELECT = {
    lotNumber: true,
    year: true,
    make: true,
    modelGroup: true,
    modelDetail: true,
    vin: true,
    bodyStyle: true,
    odometer: true,
    damageDescription: true,
    secondaryDamage: true,
    saleTitleType: true,
    hasKeys: true,
    runsDrives: true,
    locationCity: true,
    locationState: true,
    saleDate: true,
    saleStatus: true,
    highBid: true,
    buyItNowPrice: true,
    estRetailValue: true,
    repairCost: true,
    images: true,
    itemNumber: true,
};
function serializeBid(bid) {
    return {
        ...bid,
        lotNumber: bid.lotNumber?.toString(),
        maxBid: bid.maxBid?.toString(),
        finalAmount: bid.finalAmount?.toString() ?? null,
        auctionListing: bid.auctionListing
            ? {
                ...bid.auctionListing,
                lotNumber: bid.auctionListing.lotNumber?.toString(),
                highBid: bid.auctionListing.highBid?.toString() ?? null,
                buyItNowPrice: bid.auctionListing.buyItNowPrice?.toString() ?? null,
                estRetailValue: bid.auctionListing.estRetailValue?.toString() ?? null,
                repairCost: bid.auctionListing.repairCost?.toString() ?? null,
            }
            : null,
    };
}
let BuyerAuctionBidsService = class BuyerAuctionBidsService {
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
        const rows = await this.prisma.buyerAuctionBid.findMany({
            where: { buyerId, tenantId: tenantId || undefined },
            orderBy: [
                { auctionListing: { saleDate: { sort: 'asc', nulls: 'last' } } },
                { auctionListing: { itemNumber: { sort: 'asc', nulls: 'last' } } },
                { lotNumber: 'asc' },
            ],
            include: { auctionListing: { select: LISTING_SELECT } },
        });
        return rows.map(serializeBid);
    }
    async createMany(buyerId, tenantId, userId, items) {
        await this.ensureBuyer(buyerId, tenantId);
        const lotNumbers = items.map((i) => {
            try {
                return BigInt(i.lotNumber);
            }
            catch {
                throw new common_1.BadRequestException(`Invalid lotNumber: ${i.lotNumber}`);
            }
        });
        const existingListings = await this.prisma.auctionListing.findMany({
            where: { lotNumber: { in: lotNumbers } },
            select: { lotNumber: true },
        });
        const existingSet = new Set(existingListings.map((l) => l.lotNumber.toString()));
        const missing = items
            .filter((i) => !existingSet.has(i.lotNumber.toString()))
            .map((i) => i.lotNumber);
        if (missing.length > 0) {
            throw new common_1.NotFoundException(`Auction listings not found: ${missing.join(', ')}`);
        }
        const results = await this.prisma.$transaction(items.map((item) => this.prisma.buyerAuctionBid.upsert({
            where: {
                buyerId_lotNumber: {
                    buyerId,
                    lotNumber: BigInt(item.lotNumber),
                },
            },
            create: {
                buyerId,
                lotNumber: BigInt(item.lotNumber),
                maxBid: new client_1.Prisma.Decimal(item.maxBid),
                notes: item.notes ?? null,
                tenantId: tenantId || null,
                createdBy: userId,
            },
            update: {
                maxBid: new client_1.Prisma.Decimal(item.maxBid),
                ...(item.notes !== undefined && { notes: item.notes }),
            },
            include: { auctionListing: { select: LISTING_SELECT } },
        })));
        return results.map(serializeBid);
    }
    async update(id, buyerId, tenantId, dto) {
        const existing = await this.prisma.buyerAuctionBid.findFirst({
            where: { id, buyerId, tenantId: tenantId || undefined },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Bid ${id} not found`);
        }
        const data = {};
        if (dto.maxBid !== undefined)
            data.maxBid = new client_1.Prisma.Decimal(dto.maxBid);
        if (dto.status !== undefined)
            data.status = dto.status;
        if (dto.finalAmount !== undefined) {
            data.finalAmount =
                dto.finalAmount === null ? null : new client_1.Prisma.Decimal(dto.finalAmount);
        }
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        const updated = await this.prisma.buyerAuctionBid.update({
            where: { id },
            data,
            include: { auctionListing: { select: LISTING_SELECT } },
        });
        return serializeBid(updated);
    }
    async remove(id, buyerId, tenantId) {
        const existing = await this.prisma.buyerAuctionBid.findFirst({
            where: { id, buyerId, tenantId: tenantId || undefined },
            select: { id: true, status: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Bid ${id} not found`);
        }
        if (existing.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending bids can be removed. Change status to pending first.');
        }
        await this.prisma.buyerAuctionBid.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.BuyerAuctionBidsService = BuyerAuctionBidsService;
exports.BuyerAuctionBidsService = BuyerAuctionBidsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], BuyerAuctionBidsService);
//# sourceMappingURL=buyer-auction-bids.service.js.map