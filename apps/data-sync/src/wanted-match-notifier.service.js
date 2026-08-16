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
var WantedMatchNotifierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WantedMatchNotifierService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const auction_matching_1 = require("@htownautos/auction-matching");
const LOT_IN_CHUNK = 1_000;
const NOTIFY_LISTING_SELECT = {
    lotNumber: true,
    year: true,
    make: true,
    modelGroup: true,
    modelDetail: true,
    trim: true,
    vin: true,
    color: true,
    odometer: true,
    highBid: true,
    saleDate: true,
};
function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size)
        out.push(arr.slice(i, i + size));
    return out;
}
function buyerDisplayName(b) {
    if (b.isBusinessBuyer && b.businessName)
        return b.businessName;
    const name = [b.firstName, b.middleName, b.lastName, b.suffix]
        .filter(Boolean)
        .join(' ')
        .trim();
    return name || 'Customer';
}
let WantedMatchNotifierService = WantedMatchNotifierService_1 = class WantedMatchNotifierService {
    prisma;
    logger = new common_1.Logger(WantedMatchNotifierService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async notifyNewListings(newLotNumberStrings) {
        if (newLotNumberStrings.length === 0)
            return 0;
        const newLots = newLotNumberStrings.map((s) => BigInt(s));
        const prefs = await this.prisma.buyerVehiclePreference.findMany({
            select: {
                id: true,
                buyerId: true,
                tenantId: true,
                yearFrom: true,
                yearTo: true,
                make: true,
                models: true,
                trims: true,
                maxMileage: true,
                titleTypes: true,
                colors: true,
                maxCost: true,
                buyer: {
                    select: {
                        firstName: true,
                        middleName: true,
                        lastName: true,
                        suffix: true,
                        isBusinessBuyer: true,
                        businessName: true,
                        tenantId: true,
                    },
                },
            },
        });
        if (prefs.length === 0)
            return 0;
        const lotChunks = chunk(newLots, LOT_IN_CHUNK);
        const future = (0, auction_matching_1.futureSaleWhere)();
        const byBuyer = new Map();
        for (const pref of prefs) {
            const tenantId = pref.tenantId ?? pref.buyer.tenantId;
            if (!tenantId)
                continue;
            const criteria = {
                yearFrom: pref.yearFrom,
                yearTo: pref.yearTo,
                make: pref.make,
                models: pref.models,
                trims: pref.trims,
                maxMileage: pref.maxMileage,
                titleTypes: pref.titleTypes,
                colors: pref.colors,
                maxCost: pref.maxCost,
            };
            const prefWhere = (0, auction_matching_1.preferenceToWhere)(criteria);
            for (const lots of lotChunks) {
                const listings = await this.prisma.auctionListing.findMany({
                    where: {
                        AND: [prefWhere, { lotNumber: { in: lots } }, future],
                    },
                    select: NOTIFY_LISTING_SELECT,
                });
                if (listings.length === 0)
                    continue;
                let group = byBuyer.get(pref.buyerId);
                if (!group) {
                    group = {
                        buyerId: pref.buyerId,
                        tenantId,
                        buyerName: buyerDisplayName(pref.buyer),
                        lots: new Map(),
                    };
                    byBuyer.set(pref.buyerId, group);
                }
                for (const l of listings) {
                    const key = l.lotNumber.toString();
                    if (group.lots.has(key))
                        continue;
                    group.lots.set(key, {
                        lotNumber: key,
                        year: l.year,
                        make: l.make,
                        model: l.modelGroup ?? l.modelDetail,
                        trim: l.trim,
                        vin: l.vin,
                        color: l.color,
                        odometer: l.odometer != null ? Number(l.odometer) : null,
                        highBid: l.highBid?.toString() ?? null,
                        saleDate: l.saleDate,
                    });
                }
            }
        }
        if (byBuyer.size === 0)
            return 0;
        const staffByTenant = new Map();
        const tenantIds = new Set([...byBuyer.values()].map((g) => g.tenantId));
        for (const tenantId of tenantIds) {
            const members = await this.prisma.tenantUser.findMany({
                where: { tenantId, isActive: true, status: 'active' },
                select: { userId: true },
            });
            staffByTenant.set(tenantId, [...new Set(members.map((m) => m.userId))]);
        }
        const rows = [];
        for (const group of byBuyer.values()) {
            const staff = staffByTenant.get(group.tenantId) ?? [];
            if (staff.length === 0)
                continue;
            const lots = [...group.lots.values()];
            const count = lots.length;
            const message = count === 1
                ? `${group.buyerName}: 1 auto nuevo coincide con su búsqueda`
                : `${group.buyerName}: ${count} autos nuevos coinciden con su búsqueda`;
            const actionUrl = `/dashboard/customers/${group.buyerId}/edit#for-bids-matches`;
            const meta = {
                buyerId: group.buyerId,
                buyerName: group.buyerName,
                count,
                lots,
            };
            for (const userId of staff) {
                rows.push({
                    tenantId: group.tenantId,
                    userId,
                    title: 'Coincidencia de subasta',
                    message,
                    type: 'AUCTION_WANTED_MATCH',
                    entityType: 'buyer',
                    entityId: group.buyerId,
                    actionUrl,
                    priority: 'normal',
                    metaValue: meta,
                });
            }
        }
        if (rows.length === 0)
            return 0;
        const result = await this.prisma.notification.createMany({
            data: rows,
            skipDuplicates: true,
        });
        this.logger.log(`Wanted-match: ${byBuyer.size} buyer(s) matched → ${result.count} notification(s)`);
        return result.count;
    }
};
exports.WantedMatchNotifierService = WantedMatchNotifierService;
exports.WantedMatchNotifierService = WantedMatchNotifierService = WantedMatchNotifierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], WantedMatchNotifierService);
//# sourceMappingURL=wanted-match-notifier.service.js.map