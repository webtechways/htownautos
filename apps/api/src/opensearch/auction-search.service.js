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
var AuctionSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionSearchService = exports.GALLERY_CACHE_QUEUE = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const opensearch_1 = require("@htownautos/opensearch");
const prisma_1 = require("@htownautos/prisma");
const rabbitmq_1 = require("@htownautos/rabbitmq");
const common_2 = require("@htownautos/common");
const title_mapping_service_1 = require("../title-mapping/title-mapping.service");
const GALLERY_CACHE_TTL_DAYS = 30;
exports.GALLERY_CACHE_QUEUE = 'gallery.cache';
let AuctionSearchService = AuctionSearchService_1 = class AuctionSearchService {
    openSearchService;
    prisma;
    rabbitMQ;
    proxyService;
    syncService;
    titleMapping;
    logger = new common_1.Logger(AuctionSearchService_1.name);
    constructor(openSearchService, prisma, rabbitMQ, proxyService, syncService, titleMapping) {
        this.openSearchService = openSearchService;
        this.prisma = prisma;
        this.rabbitMQ = rabbitMQ;
        this.proxyService = proxyService;
        this.syncService = syncService;
        this.titleMapping = titleMapping;
    }
    async search(dto) {
        const { page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = dto;
        const from = (page - 1) * limit;
        let carfaxSourceIds;
        if (dto.hasCarfaxReport) {
            const carfaxListingIds = await this.prisma.carfaxReport.findMany({
                select: { auctionListingId: true },
                distinct: ['auctionListingId'],
            });
            carfaxSourceIds = carfaxListingIds.map((r) => r.auctionListingId.toString());
            if (carfaxSourceIds.length === 0) {
                return {
                    data: [],
                    meta: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
                };
            }
        }
        let inspectableYardNames;
        if (dto.inspectableOnly) {
            const yards = await this.prisma.yard.findMany({
                where: { physicalInspectionAvailable: true },
                select: { name: true },
            });
            inspectableYardNames = yards.map((y) => y.name);
            if (inspectableYardNames.length === 0) {
                return {
                    data: [],
                    meta: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
                };
            }
        }
        const titleOverrides = await this.titleMapping.getOverrides();
        const query = this.buildQuery(dto, carfaxSourceIds, inspectableYardNames, titleOverrides);
        const sort = this.buildSort(sortBy, sortOrder);
        const aggs = dto.includeAggregations ? this.buildAggregations() : undefined;
        const searchBody = {
            from,
            size: limit,
            query,
            sort,
            track_total_hits: true,
        };
        if (aggs) {
            searchBody.aggs = aggs;
        }
        try {
            const result = await this.openSearchService.search(opensearch_1.AUCTION_INDEX_NAME, searchBody);
            const total = result.hits.total.value || 0;
            const totalPages = Math.ceil(total / limit);
            const data = result.hits.hits.map((hit) => hit._source);
            const response = {
                data,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            };
            if (dto.includeAggregations && result.aggregations) {
                response.aggregations = this.parseAggregations(result.aggregations, titleOverrides);
            }
            return response;
        }
        catch (error) {
            this.logger.error(`Search error: ${error.message}`);
            throw error;
        }
    }
    getTodayAsInt() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return parseInt(`${y}${m}${d}`, 10);
    }
    buildQuery(dto, carfaxSourceIds, inspectableYardNames, titleOverrides) {
        const must = [];
        const filter = [];
        const explicitLookup = !!(dto.search || dto.vin || dto.sourceIds || dto.ids);
        if (!explicitLookup) {
            filter.push({
                bool: {
                    should: [
                        { bool: { must_not: { exists: { field: 'saleDate' } } } },
                        { term: { saleDate: 0 } },
                        { range: { saleDate: { gte: this.getTodayAsInt() } } },
                    ],
                    minimum_should_match: 1,
                },
            });
        }
        if (dto.search) {
            must.push({
                bool: {
                    should: [
                        {
                            multi_match: {
                                query: dto.search,
                                fields: ['vin^3', 'make^2', 'model^2', 'sourceId^2', 'damageDescription', 'heading'],
                                type: 'best_fields',
                                fuzziness: 'AUTO',
                            },
                        },
                        {
                            prefix: { sourceId: dto.search },
                        },
                    ],
                    minimum_should_match: 1,
                },
            });
        }
        if (dto.source && dto.source.length > 0) {
            filter.push({ terms: { 'source.keyword': dto.source } });
        }
        if (dto.sourceIds) {
            const ids = dto.sourceIds.split(',').map(id => id.trim());
            filter.push({ terms: { 'sourceId.keyword': ids } });
        }
        if (dto.ids) {
            const ids = dto.ids.split(',').map(id => id.trim());
            filter.push({ terms: { 'id.keyword': ids } });
        }
        if (dto.vin) {
            filter.push({ term: { 'vin.keyword': dto.vin.toUpperCase() } });
        }
        if (dto.year) {
            filter.push({ term: { year: dto.year } });
        }
        else if (dto.yearMin || dto.yearMax) {
            const rangeQuery = {};
            if (dto.yearMin)
                rangeQuery.gte = dto.yearMin;
            if (dto.yearMax)
                rangeQuery.lte = dto.yearMax;
            filter.push({ range: { year: rangeQuery } });
        }
        if (dto.make && dto.make.length > 0) {
            filter.push({ terms: { 'make.keyword': dto.make } });
        }
        if (dto.model && dto.model.length > 0) {
            filter.push({ terms: { 'model.keyword': dto.model } });
        }
        if (dto.bodyType && dto.bodyType.length > 0) {
            filter.push({ terms: { 'bodyType.keyword': dto.bodyType } });
        }
        if (dto.trim && dto.trim.length > 0) {
            filter.push({ terms: { 'trim.keyword': dto.trim } });
        }
        if (dto.yardName && dto.yardName.length > 0) {
            filter.push({ terms: { 'yardName.keyword': dto.yardName } });
        }
        if (dto.sellerName && dto.sellerName.length > 0) {
            filter.push({ terms: { 'sellerName.keyword': dto.sellerName } });
        }
        if (dto.excludeUnknownSellers) {
            filter.push({ exists: { field: 'sellerName' } });
        }
        if (dto.transmission) {
            filter.push({ term: { 'transmission.keyword': dto.transmission } });
        }
        if (dto.fuelType) {
            filter.push({ term: { 'fuelType.keyword': dto.fuelType } });
        }
        if (dto.drivetrain && dto.drivetrain.length > 0) {
            filter.push({ terms: { 'drivetrain.keyword': dto.drivetrain } });
        }
        if (dto.color && dto.color.length > 0) {
            filter.push({ terms: { 'color.keyword': dto.color } });
        }
        if (dto.cylinders && dto.cylinders.length > 0) {
            filter.push({ terms: { 'cylinders.keyword': dto.cylinders } });
        }
        if (dto.sellerCategory && dto.sellerCategory.length > 0) {
            filter.push({ terms: { 'sellerCategory.keyword': dto.sellerCategory } });
        }
        if (dto.engineSizeMin !== undefined || dto.engineSizeMax !== undefined) {
            const rangeQuery = {};
            if (dto.engineSizeMin !== undefined)
                rangeQuery.gte = dto.engineSizeMin;
            if (dto.engineSizeMax !== undefined)
                rangeQuery.lte = dto.engineSizeMax;
            filter.push({ range: { engineSizeL: rangeQuery } });
        }
        if (dto.zip && dto.radiusMiles && dto.radiusMiles > 0) {
            const center = (0, common_2.geocodeZip)(dto.zip);
            if (center) {
                const box = (0, common_2.boundingBox)(center, dto.radiusMiles);
                filter.push({ range: { 'geoPoint.lat': { gte: box.minLat, lte: box.maxLat } } });
                filter.push({ range: { 'geoPoint.lon': { gte: box.minLon, lte: box.maxLon } } });
            }
        }
        if (dto.locationState && dto.locationState.length > 0) {
            filter.push({ terms: { 'locationState.keyword': dto.locationState } });
        }
        if (dto.odometerMin !== undefined || dto.odometerMax !== undefined) {
            const rangeQuery = {};
            if (dto.odometerMin !== undefined)
                rangeQuery.gte = dto.odometerMin;
            if (dto.odometerMax !== undefined)
                rangeQuery.lte = dto.odometerMax;
            filter.push({ range: { odometer: rangeQuery } });
        }
        if (dto.odometerBrand) {
            filter.push({ term: { 'odometerBrand.keyword': dto.odometerBrand } });
        }
        if (dto.damageDescription && dto.damageDescription.length > 0) {
            filter.push({
                terms: { 'damageDescription.keyword': dto.damageDescription },
            });
        }
        if (dto.saleStatus) {
            filter.push({ term: { 'saleStatus.keyword': dto.saleStatus } });
        }
        if (dto.saleTitleType && dto.saleTitleType.length > 0) {
            filter.push({
                terms: { 'saleTitleType.keyword': dto.saleTitleType },
            });
        }
        if (dto.titleCategory && dto.titleCategory.length > 0) {
            const bothCases = (arr) => Array.from(new Set(arr.flatMap((c) => [c.toLowerCase(), c.toUpperCase()])));
            const cats = dto.titleCategory;
            const known = cats.filter((c) => c !== 'unknown');
            const wantUnknown = cats.includes('unknown');
            const should = [];
            if (known.length > 0) {
                const codes = (0, common_2.codesForTitleCategories)(known, titleOverrides);
                if (codes.length > 0)
                    should.push({ terms: { 'saleTitleType.keyword': bothCases(codes) } });
            }
            if (wantUnknown) {
                should.push({
                    bool: { must_not: { terms: { 'saleTitleType.keyword': bothCases((0, common_2.allKnownCodes)(titleOverrides)) } } },
                });
            }
            if (should.length === 1) {
                filter.push(should[0]);
            }
            else if (should.length > 1) {
                filter.push({ bool: { should, minimum_should_match: 1 } });
            }
        }
        if (dto.hasKeys) {
            filter.push({ term: { 'hasKeys.keyword': dto.hasKeys } });
        }
        if (dto.runsDrives) {
            filter.push({ term: { 'runsDrives.keyword': dto.runsDrives } });
        }
        if (dto.lotCondCode) {
            filter.push({ term: { 'lotCondCode.keyword': dto.lotCondCode } });
        }
        if (dto.wholesale) {
            filter.push({ term: { 'wholesale.keyword': dto.wholesale } });
        }
        if (dto.saleLight && dto.saleLight.length > 0) {
            filter.push({ terms: { 'saleLight.keyword': dto.saleLight } });
        }
        if (dto.hasBuyItNow) {
            filter.push({ range: { buyItNowPrice: { gt: 0 } } });
        }
        if (dto.priceMin !== undefined || dto.priceMax !== undefined) {
            const rangeQuery = {};
            if (dto.priceMin !== undefined)
                rangeQuery.gte = dto.priceMin;
            if (dto.priceMax !== undefined)
                rangeQuery.lte = dto.priceMax;
            filter.push({ range: { estRetailValue: rangeQuery } });
        }
        if (dto.saleDateFrom || dto.saleDateTo) {
            const rangeQuery = {};
            if (dto.saleDateFrom)
                rangeQuery.gte = dto.saleDateFrom;
            if (dto.saleDateTo)
                rangeQuery.lte = dto.saleDateTo;
            filter.push({ range: { saleDate: rangeQuery } });
        }
        if (dto.carfaxCleanTitle !== undefined) {
            filter.push({ term: { carfaxCleanTitle: dto.carfaxCleanTitle } });
        }
        if (dto.carfax1Owner !== undefined) {
            filter.push({ term: { carfax1Owner: dto.carfax1Owner } });
        }
        if (dto.domMax !== undefined) {
            filter.push({ range: { dom: { lte: dto.domMax } } });
        }
        if (carfaxSourceIds && carfaxSourceIds.length > 0) {
            filter.push({ terms: { 'sourceId.keyword': carfaxSourceIds } });
        }
        if (dto.discarded === true) {
            filter.push({ term: { discarded: true } });
        }
        if (inspectableYardNames && inspectableYardNames.length > 0) {
            filter.push({ terms: { 'yardName.keyword': inspectableYardNames } });
        }
        if (must.length === 0 && filter.length === 0) {
            return { match_all: {} };
        }
        return {
            bool: {
                ...(must.length > 0 && { must }),
                ...(filter.length > 0 && { filter }),
            },
        };
    }
    buildSort(sortBy, sortOrder) {
        const sortField = this.getSortField(sortBy);
        return [
            { [sortField]: { order: sortOrder, unmapped_type: 'long' } },
            { _score: { order: 'desc' } },
        ];
    }
    getSortField(sortBy) {
        const fieldMap = {
            year: 'year',
            make: 'make.keyword',
            odometer: 'odometer',
            saleDate: 'saleDate',
            highBid: 'highBid',
            estRetailValue: 'estRetailValue',
            createdAt: 'createdAt',
            dom: 'dom',
            locationState: 'locationState.keyword',
            saleTitleType: 'saleTitleType.keyword',
        };
        return fieldMap[sortBy] || 'createdAt';
    }
    buildAggregations() {
        return {
            sources: {
                terms: { field: 'source.keyword', size: 10 },
            },
            makes: {
                terms: { field: 'make.keyword', size: 50 },
            },
            models: {
                terms: { field: 'model.keyword', size: 100 },
            },
            trims: {
                terms: { field: 'trim.keyword', size: 100 },
            },
            years: {
                terms: { field: 'year', size: 30, order: { _key: 'desc' } },
            },
            states: {
                terms: { field: 'locationState.keyword', size: 60 },
            },
            bodyTypes: {
                terms: { field: 'bodyType.keyword', size: 20 },
            },
            transmissions: {
                terms: { field: 'transmission.keyword', size: 10 },
            },
            fuelTypes: {
                terms: { field: 'fuelType.keyword', size: 10 },
            },
            damageTypes: {
                terms: { field: 'damageDescription.keyword', size: 30 },
            },
            saleStatuses: {
                terms: { field: 'saleStatus.keyword', size: 10 },
            },
            titleTypes: {
                terms: { field: 'saleTitleType.keyword', size: 40 },
            },
            colors: {
                terms: { field: 'color.keyword', size: 40 },
            },
            cylinders: {
                terms: { field: 'cylinders.keyword', size: 20 },
            },
            drivetrains: {
                terms: { field: 'drivetrain.keyword', size: 20 },
            },
            sellerCategories: {
                terms: { field: 'sellerCategory.keyword', size: 10 },
            },
            yards: {
                terms: { field: 'yardName.keyword', size: 100 },
            },
            sellers: {
                terms: { field: 'sellerName.keyword', size: 200 },
            },
            lotCondCodes: {
                terms: { field: 'lotCondCode.keyword', size: 20 },
            },
            runsDrivesOptions: {
                terms: { field: 'runsDrives.keyword', size: 10 },
            },
            saleLights: {
                terms: { field: 'saleLight.keyword', size: 10 },
            },
        };
    }
    parseAggregations(aggs, titleOverrides) {
        const parseBuckets = (buckets) => {
            return (buckets || []).map((bucket) => ({
                key: bucket.key,
                count: bucket.doc_count,
            }));
        };
        const titleTypeBuckets = parseBuckets(aggs.titleTypes?.buckets);
        const categoryCounts = {
            clean: 0,
            nonrepairable: 0,
            salvage: 0,
            unknown: 0,
        };
        for (const b of titleTypeBuckets) {
            categoryCounts[(0, common_2.deriveTitleCategory)(String(b.key), titleOverrides)] += b.count;
        }
        const titleCategories = Object.keys(categoryCounts)
            .map((key) => ({ key, count: categoryCounts[key] }))
            .filter((b) => b.count > 0);
        return {
            sources: parseBuckets(aggs.sources?.buckets),
            makes: parseBuckets(aggs.makes?.buckets),
            models: parseBuckets(aggs.models?.buckets),
            trims: parseBuckets(aggs.trims?.buckets),
            years: parseBuckets(aggs.years?.buckets),
            states: parseBuckets(aggs.states?.buckets),
            bodyTypes: parseBuckets(aggs.bodyTypes?.buckets),
            transmissions: parseBuckets(aggs.transmissions?.buckets),
            fuelTypes: parseBuckets(aggs.fuelTypes?.buckets),
            damageTypes: parseBuckets(aggs.damageTypes?.buckets),
            saleStatuses: parseBuckets(aggs.saleStatuses?.buckets),
            titleTypes: titleTypeBuckets,
            titleCategories,
            colors: parseBuckets(aggs.colors?.buckets),
            cylinders: parseBuckets(aggs.cylinders?.buckets),
            drivetrains: parseBuckets(aggs.drivetrains?.buckets),
            sellerCategories: parseBuckets(aggs.sellerCategories?.buckets),
            yards: parseBuckets(aggs.yards?.buckets),
            sellers: parseBuckets(aggs.sellers?.buckets),
            lotCondCodes: parseBuckets(aggs.lotCondCodes?.buckets),
            runsDrivesOptions: parseBuckets(aggs.runsDrivesOptions?.buckets),
            saleLights: parseBuckets(aggs.saleLights?.buckets),
        };
    }
    async getFilterOptions(dto) {
        const titleOverrides = await this.titleMapping.getOverrides();
        const query = dto ? this.buildQuery(dto, undefined, undefined, titleOverrides) : { match_all: {} };
        const searchBody = {
            size: 0,
            query,
            aggs: this.buildAggregations(),
        };
        try {
            const result = await this.openSearchService.search(opensearch_1.AUCTION_INDEX_NAME, searchBody);
            return this.parseAggregations(result.aggregations, titleOverrides);
        }
        catch (error) {
            this.logger.error(`Error getting filter options: ${error.message}`);
            throw error;
        }
    }
    async findById(id) {
        try {
            const client = this.openSearchService.getClient();
            const result = await client.get({
                index: opensearch_1.AUCTION_INDEX_NAME,
                id,
            });
            return result.body._source ?? null;
        }
        catch (error) {
            if (error.meta?.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }
    async findBySourceId(source, sourceId) {
        const id = `${source}_${sourceId}`;
        const doc = await this.findById(id);
        if (!doc)
            return null;
        const discardFields = await this.getDiscardFields(sourceId);
        return {
            ...doc,
            discarded: discardFields?.discarded ?? false,
            discardReason: discardFields?.discardReason ?? null,
            discardedAt: discardFields?.discardedAt ?? null,
        };
    }
    async getDiscardFields(sourceId) {
        let lotNumber;
        try {
            lotNumber = BigInt(sourceId);
        }
        catch {
            return null;
        }
        const row = await this.prisma.auctionListing.findUnique({
            where: { lotNumber },
            select: { discarded: true, discardReason: true, discardedAt: true },
        });
        if (!row)
            return null;
        return {
            discarded: row.discarded,
            discardReason: row.discardReason,
            discardedAt: row.discardedAt,
        };
    }
    async discardListing(sourceId, discarded, reason, userId) {
        const lotNumber = BigInt(sourceId);
        const existing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber },
            select: { lotNumber: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Auction listing ${sourceId} not found`);
        }
        const updated = await this.prisma.auctionListing.update({
            where: { lotNumber },
            data: {
                discarded,
                discardReason: discarded ? (reason ?? null) : null,
                discardedAt: discarded ? new Date() : null,
                discardedById: discarded ? (userId ?? null) : null,
            },
            select: { lotNumber: true, discarded: true, discardReason: true, discardedAt: true },
        });
        try {
            const full = await this.prisma.auctionListing.findUnique({ where: { lotNumber } });
            if (full)
                await this.syncService.indexCopartListing(full);
        }
        catch (err) {
            this.logger.warn(`[Discard] Reindex failed for lot ${sourceId}: ${err.message}`);
        }
        return {
            lotNumber: updated.lotNumber.toString(),
            discarded: updated.discarded,
            discardReason: updated.discardReason,
            discardedAt: updated.discardedAt,
        };
    }
    async refreshHighBid(lotNumberStr) {
        this.logger.log(`[BidRefresh] === Start lot ${lotNumberStr} ===`);
        const lotNumber = BigInt(lotNumberStr);
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber },
        });
        if (!listing) {
            this.logger.warn(`[BidRefresh] Listing ${lotNumberStr} not found in DB`);
            throw new common_1.NotFoundException(`Auction listing ${lotNumberStr} not found`);
        }
        this.logger.log(`[BidRefresh] Current DB highBid: ${listing.highBid?.toString() ?? 'null'}`);
        const url = `https://www.autobidmaster.com/en/search/lot/${lotNumberStr}/?fallback=true`;
        this.logger.log(`[BidRefresh] Fetching ${url}`);
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                Cookie: 'screenSize=1920x1080; cookietest=1',
            },
            redirect: 'follow',
        });
        this.logger.log(`[BidRefresh] HTTP ${res.status} ${res.statusText} (final url: ${res.url})`);
        if (!res.ok) {
            throw new Error(`autobidmaster returned ${res.status}`);
        }
        const html = await res.text();
        this.logger.log(`[BidRefresh] HTML size: ${html.length} bytes`);
        const matchIdx = html.indexOf('qa_current_bid');
        if (matchIdx === -1) {
            this.logger.warn(`[BidRefresh] qa_current_bid NOT present in HTML for lot ${lotNumberStr}. ` +
                `First 400 chars: ${html.slice(0, 400)}`);
        }
        else {
            const snippet = html.slice(Math.max(0, matchIdx - 80), matchIdx + 250);
            this.logger.log(`[BidRefresh] qa_current_bid snippet: ${snippet}`);
        }
        const highBid = parseAutobidmasterHighBid(html);
        this.logger.log(`[BidRefresh] Parsed highBid: ${highBid}`);
        const updated = await this.prisma.auctionListing.update({
            where: { lotNumber },
            data: { highBid },
        });
        this.logger.log(`[BidRefresh] DB updated. New highBid: ${updated.highBid?.toString() ?? 'null'}`);
        try {
            const ok = await this.syncService.indexCopartListing(updated);
            this.logger.log(`[BidRefresh] Reindex result: ${ok}`);
        }
        catch (err) {
            this.logger.warn(`[BidRefresh] Failed to reindex lot ${lotNumberStr}: ${err.message}`);
        }
        this.logger.log(`[BidRefresh] === Done lot ${lotNumberStr} → ${highBid} ===`);
        return { lotNumber: lotNumberStr, highBid };
    }
    async getLastSyncTime() {
        const result = await this.prisma.auctionListing.aggregate({
            _max: { updatedAt: true },
            _count: true,
        });
        return {
            lastSyncAt: result._max.updatedAt,
            totalListings: result._count,
        };
    }
    async getCopartGalleryRaw(lotNumberStr) {
        const images = await this.fetchCopartImages(lotNumberStr);
        return { lotNumber: lotNumberStr, imageCount: images.length, images };
    }
    async getCopartGallery(lotNumberStr) {
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber: BigInt(lotNumberStr) },
            select: { lotNumber: true, images: true, galleryCache: true, galleryCachedAt: true },
        });
        if (!listing) {
            throw new common_1.NotFoundException(`Auction listing with lot number ${lotNumberStr} not found`);
        }
        const lotNumber = listing.lotNumber.toString();
        if (listing.galleryCache && listing.galleryCachedAt) {
            const ageMs = Date.now() - listing.galleryCachedAt.getTime();
            const ageDays = ageMs / (1000 * 60 * 60 * 24);
            if (ageDays < GALLERY_CACHE_TTL_DAYS) {
                try {
                    const cached = JSON.parse(listing.galleryCache);
                    this.logger.log(`[Gallery] Cache HIT for lot ${lotNumber} (${cached.imageCount} images, ${ageDays.toFixed(1)}d old)`);
                    return cached;
                }
                catch {
                    this.logger.warn(`[Gallery] Invalid cache JSON for lot ${lotNumber}, refetching`);
                }
            }
            else {
                this.logger.log(`[Gallery] Cache EXPIRED for lot ${lotNumber} (${ageDays.toFixed(1)}d old), refetching`);
            }
        }
        this.logger.log(`[Gallery] Cache MISS for lot ${lotNumber}, fetching from Copart`);
        const images = await this.fetchCopartImages(lotNumber);
        if (images.length > 0) {
            this.rabbitMQ.publish(exports.GALLERY_CACHE_QUEUE, { lotNumber, images }).catch(() => { });
        }
        return { lotNumber, imageCount: images.length, images };
    }
    async fetchCopartImages(lotNumber) {
        const apiUrl = `https://inventoryv2.copart.io/v1/lotImages/${lotNumber}`;
        try {
            const response = await this.proxyService.fetchViaProxy(apiUrl);
            if (!response.ok) {
                this.logger.warn(`[Gallery] Copart API returned ${response.status} for lot ${lotNumber}`);
                return [];
            }
            const data = await response.json();
            if (!data.lotImages || !Array.isArray(data.lotImages)) {
                return [];
            }
            return data.lotImages
                .filter((img) => img.sequence < 90)
                .sort((a, b) => a.sequence - b.sequence)
                .map((img) => {
                const thumbnailLink = img.link?.find((l) => l.isThumbNail);
                const hdLink = img.link?.find((l) => l.isHdImage);
                const fallbackUrl = img.link?.[0]?.url?.trim() || '';
                return {
                    sequence: img.sequence,
                    thumbnail: thumbnailLink?.url?.trim() || fallbackUrl,
                    fullSize: hdLink?.url?.trim() || fallbackUrl,
                };
            })
                .filter((img) => img.thumbnail || img.fullSize);
        }
        catch (error) {
            this.logger.error(`[Gallery] Error fetching Copart API for lot ${lotNumber}: ${error.message}`);
            return [];
        }
    }
    async cleanupExpiredGalleryCache() {
        try {
            const cutoff = new Date(Date.now() - GALLERY_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
            const result = await this.prisma.auctionListing.updateMany({
                where: {
                    galleryCachedAt: { lt: cutoff },
                    galleryCache: { not: null },
                },
                data: {
                    galleryCache: null,
                    galleryCachedAt: null,
                },
            });
            if (result.count > 0) {
                this.logger.log(`[Gallery] Cleaned ${result.count} expired gallery caches from DB`);
            }
        }
        catch (err) {
            this.logger.warn(`[Gallery] Failed to cleanup expired caches: ${err.message}`);
        }
    }
    async upsertAnalysisSnapshot(sourceId, type, data) {
        let listingId;
        try {
            listingId = BigInt(sourceId);
        }
        catch {
            throw new common_1.BadRequestException(`sourceId must be numeric; received "${sourceId}"`);
        }
        const jsonData = data;
        await this.prisma.auctionAnalysisSnapshot.upsert({
            where: { auctionListingId_type: { auctionListingId: listingId, type } },
            create: { auctionListingId: listingId, type, data: jsonData },
            update: { data: jsonData },
        });
        return { ok: true };
    }
    async getAnalysisSnapshots(sourceId) {
        let listingId;
        try {
            listingId = BigInt(sourceId);
        }
        catch {
            throw new common_1.BadRequestException(`sourceId must be numeric; received "${sourceId}"`);
        }
        const rows = await this.prisma.auctionAnalysisSnapshot.findMany({
            where: { auctionListingId: listingId },
            select: { type: true, data: true },
        });
        const map = {};
        for (const r of rows)
            map[r.type] = r.data;
        return { data: map };
    }
};
exports.AuctionSearchService = AuctionSearchService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchService.prototype, "cleanupExpiredGalleryCache", null);
exports.AuctionSearchService = AuctionSearchService = AuctionSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [opensearch_1.OpenSearchService,
        prisma_1.PrismaService,
        rabbitmq_1.RabbitMQService,
        common_2.ProxyService,
        opensearch_1.AuctionSyncService,
        title_mapping_service_1.TitleMappingService])
], AuctionSearchService);
function parseAutobidmasterHighBid(html) {
    const match = html.match(/class="[^"]*qa_current_bid[^"]*"[^>]*>([^<]+)/);
    if (!match)
        return null;
    const digits = match[1].replace(/[^0-9.]/g, '');
    if (!digits)
        return null;
    const num = Number(digits);
    return Number.isFinite(num) ? num : null;
}
//# sourceMappingURL=auction-search.service.js.map