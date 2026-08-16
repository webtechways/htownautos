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
var AuctionSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const opensearch_service_1 = require("./opensearch.service");
const auction_index_service_1 = require("./auction-index.service");
const common_2 = require("@htownautos/common");
let AuctionSyncService = AuctionSyncService_1 = class AuctionSyncService {
    prisma;
    openSearchService;
    logger = new common_1.Logger(AuctionSyncService_1.name);
    BATCH_SIZE = 500;
    constructor(prisma, openSearchService) {
        this.prisma = prisma;
        this.openSearchService = openSearchService;
    }
    async syncAllCopart() {
        this.logger.log('Starting full Copart sync...');
        let success = 0;
        let failed = 0;
        let offset = 0;
        let hasMore = true;
        while (hasMore) {
            const listings = await this.prisma.auctionListing.findMany({
                skip: offset,
                take: this.BATCH_SIZE,
                orderBy: { lotNumber: 'asc' },
            });
            if (listings.length === 0) {
                hasMore = false;
                break;
            }
            const documents = listings.map((listing) => ({
                id: `copart_${listing.lotNumber.toString()}`,
                body: this.mapCopartToUnified(listing),
            }));
            const result = await this.openSearchService.bulkIndex(auction_index_service_1.AUCTION_INDEX_NAME, documents);
            success += result.success;
            failed += result.failed;
            if (result.errors.length > 0) {
                this.logger.warn(`Batch errors: ${result.errors.slice(0, 5).join(', ')}`);
            }
            this.logger.log(`Copart sync progress: ${offset + listings.length} processed`);
            offset += this.BATCH_SIZE;
            if (listings.length < this.BATCH_SIZE) {
                hasMore = false;
            }
        }
        this.logger.log(`Copart sync complete: ${success} success, ${failed} failed`);
        return { success, failed, total: success + failed };
    }
    async syncAll() {
        const copart = await this.syncAllCopart();
        return { copart };
    }
    async indexCopartListing(listing) {
        const document = this.mapCopartToUnified(listing);
        return this.openSearchService.indexDocument(auction_index_service_1.AUCTION_INDEX_NAME, `copart_${listing.lotNumber.toString()}`, document);
    }
    async indexCopartListings(listings) {
        if (listings.length === 0) {
            return { success: 0, failed: 0 };
        }
        const documents = listings.map((listing) => ({
            id: `copart_${listing.lotNumber.toString()}`,
            body: this.mapCopartToUnified(listing),
        }));
        return this.openSearchService.bulkIndex(auction_index_service_1.AUCTION_INDEX_NAME, documents);
    }
    async deleteCopartListing(lotNumber) {
        return this.openSearchService.deleteDocument(auction_index_service_1.AUCTION_INDEX_NAME, `copart_${lotNumber}`);
    }
    mapCopartToUnified(listing) {
        const lotNumber = listing.lotNumber.toString();
        let images = [];
        let mainImage = null;
        if (listing.images) {
            try {
                const parsed = JSON.parse(listing.images);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    images = parsed;
                    mainImage = parsed[0];
                }
            }
            catch {
            }
        }
        let saleDateFormatted = null;
        if (listing.saleDate && listing.saleDate !== 0) {
            const dateStr = listing.saleDate.toString();
            if (dateStr.length === 8) {
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);
                saleDateFormatted = `${year}-${month}-${day}`;
            }
        }
        return {
            id: lotNumber,
            source: 'copart',
            sourceId: lotNumber,
            vin: listing.vin || null,
            year: listing.year || null,
            make: listing.make || null,
            model: listing.modelDetail || listing.modelGroup || null,
            trim: listing.trim || null,
            bodyType: listing.bodyStyle || null,
            color: listing.color || null,
            interiorColor: null,
            engine: listing.engine || null,
            transmission: listing.transmission || null,
            fuelType: listing.fuelType || null,
            drivetrain: listing.drive || null,
            cylinders: listing.cylinders || null,
            odometer: listing.odometer ? Number(listing.odometer) : null,
            odometerBrand: listing.odometerBrand || null,
            locationCity: listing.locationCity || null,
            locationState: listing.locationState || null,
            locationZip: listing.locationZip || null,
            locationCountry: listing.locationCountry || null,
            images,
            mainImage,
            createdAt: listing.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: listing.updatedAt?.toISOString() || null,
            indexedAt: new Date().toISOString(),
            damageDescription: listing.damageDescription || null,
            secondaryDamage: listing.secondaryDamage || null,
            saleDate: listing.saleDate || null,
            saleDateFormatted,
            dayOfWeek: listing.dayOfWeek || null,
            saleTime: listing.saleTime || null,
            saleStatus: listing.saleStatus || null,
            saleTitleState: listing.saleTitleState || null,
            saleTitleType: listing.saleTitleType || null,
            hasKeys: listing.hasKeys || null,
            runsDrives: listing.runsDrives || null,
            lotCondCode: listing.lotCondCode || null,
            wholesale: listing.wholesale || null,
            saleLight: listing.saleLight || null,
            highBid: listing.highBid ? Number(listing.highBid) : null,
            buyItNowPrice: listing.buyItNowPrice ? Number(listing.buyItNowPrice) : null,
            estRetailValue: listing.estRetailValue ? Number(listing.estRetailValue) : null,
            repairCost: listing.repairCost ? Number(listing.repairCost) : null,
            yardName: listing.yardName || null,
            yardNumber: listing.yardNumber || null,
            itemNumber: listing.itemNumber || null,
            sellerName: listing.sellerName || null,
            sellerCategory: listing.sellerCategory ||
                (0, common_2.deriveSellerCategory)(listing.rentals, listing.sellerName),
            engineSizeL: listing.engineSizeL != null
                ? Number(listing.engineSizeL)
                : (0, common_2.parseEngineSizeL)(listing.engine),
            geoPoint: (() => {
                if (listing.locationLat != null && listing.locationLng != null) {
                    return { lat: Number(listing.locationLat), lon: Number(listing.locationLng) };
                }
                const g = (0, common_2.geocodeZip)(listing.locationZip);
                return g ? { lat: g.lat, lon: g.lon } : null;
            })(),
            discarded: listing.discarded ?? false,
            discardReason: listing.discardReason ?? null,
            discardedAt: listing.discardedAt?.toISOString() ?? null,
            carfax1Owner: null,
            carfaxCleanTitle: null,
            dom: null,
            domActive: null,
            dealerName: null,
            dealerCity: null,
            dealerState: null,
            dealerPhone: null,
            heading: null,
            vdpUrl: null,
            sellerType: null,
            inventoryType: null,
        };
    }
    async getSyncStats() {
        const [copartCount, indexCount] = await Promise.all([
            this.prisma.auctionListing.count(),
            this.openSearchService.count(auction_index_service_1.AUCTION_INDEX_NAME),
        ]);
        return {
            copartInDb: copartCount,
            totalInIndex: indexCount,
        };
    }
};
exports.AuctionSyncService = AuctionSyncService;
exports.AuctionSyncService = AuctionSyncService = AuctionSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        opensearch_service_1.OpenSearchService])
], AuctionSyncService);
//# sourceMappingURL=auction-sync.service.js.map