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
var AuctionIndexService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionIndexService = exports.AUCTION_INDEX_NAME = void 0;
const common_1 = require("@nestjs/common");
const opensearch_service_1 = require("./opensearch.service");
exports.AUCTION_INDEX_NAME = 'auction_listings';
let AuctionIndexService = AuctionIndexService_1 = class AuctionIndexService {
    openSearchService;
    logger = new common_1.Logger(AuctionIndexService_1.name);
    constructor(openSearchService) {
        this.openSearchService = openSearchService;
    }
    async onModuleInit() {
        await this.ensureIndex();
    }
    async ensureIndex() {
        const exists = await this.openSearchService.indexExists(exports.AUCTION_INDEX_NAME);
        if (exists) {
            this.logger.log(`Index ${exports.AUCTION_INDEX_NAME} already exists`);
            return true;
        }
        return this.createIndex();
    }
    async createIndex() {
        const mapping = {
            settings: {
                number_of_shards: 1,
                number_of_replicas: 0,
                analysis: {
                    analyzer: {
                        lowercase_analyzer: {
                            type: 'custom',
                            tokenizer: 'standard',
                            filter: ['lowercase'],
                        },
                    },
                    normalizer: {
                        lowercase_normalizer: {
                            type: 'custom',
                            filter: ['lowercase'],
                        },
                    },
                },
            },
            mappings: {
                properties: {
                    id: { type: 'keyword' },
                    source: { type: 'keyword' },
                    sourceId: { type: 'keyword' },
                    vin: { type: 'keyword' },
                    year: { type: 'integer' },
                    make: {
                        type: 'text',
                        analyzer: 'lowercase_analyzer',
                        fields: {
                            keyword: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                            raw: { type: 'keyword' },
                        },
                    },
                    model: {
                        type: 'text',
                        analyzer: 'lowercase_analyzer',
                        fields: {
                            keyword: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                            raw: { type: 'keyword' },
                        },
                    },
                    trim: { type: 'keyword' },
                    bodyType: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    color: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    interiorColor: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    engine: { type: 'keyword' },
                    transmission: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    fuelType: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    drivetrain: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    cylinders: { type: 'keyword' },
                    odometer: { type: 'float' },
                    odometerBrand: { type: 'keyword' },
                    locationCity: { type: 'keyword' },
                    locationState: { type: 'keyword' },
                    locationZip: { type: 'keyword' },
                    locationCountry: { type: 'keyword' },
                    images: { type: 'keyword' },
                    mainImage: { type: 'keyword' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' },
                    indexedAt: { type: 'date' },
                    damageDescription: {
                        type: 'text',
                        analyzer: 'lowercase_analyzer',
                        fields: {
                            keyword: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                            raw: { type: 'keyword' },
                        },
                    },
                    secondaryDamage: {
                        type: 'text',
                        analyzer: 'lowercase_analyzer',
                        fields: {
                            keyword: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                        },
                    },
                    saleDate: { type: 'integer' },
                    saleDateFormatted: { type: 'keyword' },
                    dayOfWeek: { type: 'keyword' },
                    saleTime: { type: 'keyword' },
                    saleStatus: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    saleTitleState: { type: 'keyword' },
                    saleTitleType: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    hasKeys: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    runsDrives: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    lotCondCode: { type: 'keyword' },
                    wholesale: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    saleLight: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    highBid: { type: 'float' },
                    buyItNowPrice: { type: 'float' },
                    estRetailValue: { type: 'float' },
                    repairCost: { type: 'float' },
                    yardName: { type: 'keyword' },
                    yardNumber: { type: 'integer' },
                    itemNumber: { type: 'integer' },
                    sellerName: { type: 'keyword' },
                    sellerCategory: { type: 'keyword', normalizer: 'lowercase_normalizer' },
                    engineSizeL: { type: 'float' },
                    geoPoint: { properties: { lat: { type: 'float' }, lon: { type: 'float' } } },
                    carfax1Owner: { type: 'boolean' },
                    carfaxCleanTitle: { type: 'boolean' },
                    dom: { type: 'integer' },
                    domActive: { type: 'integer' },
                    dealerName: { type: 'keyword' },
                    dealerCity: { type: 'keyword' },
                    dealerState: { type: 'keyword' },
                    dealerPhone: { type: 'keyword' },
                    heading: { type: 'text' },
                    vdpUrl: { type: 'keyword' },
                    sellerType: { type: 'keyword' },
                    inventoryType: { type: 'keyword' },
                },
            },
        };
        return this.openSearchService.createIndex(exports.AUCTION_INDEX_NAME, mapping);
    }
    async deleteIndex() {
        return this.openSearchService.deleteIndex(exports.AUCTION_INDEX_NAME);
    }
    async recreateIndex() {
        this.logger.log('Recreating auction index...');
        await this.deleteIndex();
        return this.createIndex();
    }
    async getIndexStats() {
        try {
            const client = this.openSearchService.getClient();
            const stats = await client.indices.stats({ index: exports.AUCTION_INDEX_NAME });
            const primaries = stats.body._all?.primaries;
            const docCount = primaries?.docs?.count ?? 0;
            const sizeBytes = primaries?.store?.size_in_bytes ?? 0;
            return {
                documentCount: docCount,
                sizeInBytes: sizeBytes,
                sizeHuman: this.formatBytes(sizeBytes),
            };
        }
        catch (error) {
            this.logger.error(`Error getting index stats: ${error.message}`);
            return null;
        }
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
exports.AuctionIndexService = AuctionIndexService;
exports.AuctionIndexService = AuctionIndexService = AuctionIndexService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [opensearch_service_1.OpenSearchService])
], AuctionIndexService);
//# sourceMappingURL=auction-index.service.js.map