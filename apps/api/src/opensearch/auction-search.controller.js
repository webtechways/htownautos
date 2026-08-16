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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionSearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auction_search_service_1 = require("./auction-search.service");
const opensearch_1 = require("@htownautos/opensearch");
const rabbitmq_1 = require("@htownautos/rabbitmq");
const search_auctions_dto_1 = require("./dto/search-auctions.dto");
const discard_auction_dto_1 = require("./dto/discard-auction.dto");
const upsert_analysis_snapshot_dto_1 = require("./dto/upsert-analysis-snapshot.dto");
const auth_1 = require("@htownautos/auth");
const prisma_1 = require("@htownautos/prisma");
let AuctionSearchController = class AuctionSearchController {
    searchService;
    syncService;
    indexService;
    rabbitMQ;
    prisma;
    constructor(searchService, syncService, indexService, rabbitMQ, prisma) {
        this.searchService = searchService;
        this.syncService = syncService;
        this.indexService = indexService;
        this.rabbitMQ = rabbitMQ;
        this.prisma = prisma;
    }
    async search(dto) {
        return this.searchService.search(dto);
    }
    async getFilterOptions(dto) {
        return this.searchService.getFilterOptions(dto);
    }
    async getCopartGallery(id, bypass) {
        if (bypass === 'true') {
            return this.searchService.getCopartGalleryRaw(id);
        }
        return this.searchService.getCopartGallery(id);
    }
    async getLastSync() {
        return this.searchService.getLastSyncTime();
    }
    async importCopart() {
        return this.publishSync({ kind: 'copart-import' });
    }
    async recreateAndImport() {
        return this.publishSync({ kind: 'copart-import-recreate' });
    }
    async syncAll() {
        return this.publishSync({ kind: 'reindex-all' });
    }
    async syncCopart() {
        return this.publishSync({ kind: 'reindex-copart' });
    }
    async getSyncStats() {
        return this.syncService.getSyncStats();
    }
    async getSyncStatus() {
        const STALE_RUNNING_MS = 2 * 60 * 60 * 1000;
        const freshCutoff = new Date(Date.now() - STALE_RUNNING_MS);
        const running = await this.prisma.syncRun.findFirst({
            where: {
                source: 'copart',
                status: 'running',
                startedAt: { gte: freshCutoff },
            },
            orderBy: { startedAt: 'desc' },
            select: {
                status: true,
                phase: true,
                progress: true,
                processedRows: true,
                totalRows: true,
                startedAt: true,
                finishedAt: true,
                durationMs: true,
                source: true,
                bytesDownloaded: true,
                rowsParsed: true,
                rowsUpserted: true,
                rowsStaleMarked: true,
            },
        });
        if (running)
            return running;
        const latest = await this.prisma.syncRun.findFirst({
            where: { source: 'copart' },
            orderBy: { startedAt: 'desc' },
            select: {
                status: true,
                phase: true,
                progress: true,
                processedRows: true,
                totalRows: true,
                startedAt: true,
                finishedAt: true,
                durationMs: true,
                source: true,
                bytesDownloaded: true,
                rowsParsed: true,
                rowsUpserted: true,
                rowsStaleMarked: true,
            },
        });
        if (!latest)
            return { status: 'idle', progress: 0 };
        if (latest.status === 'running' && latest.startedAt < freshCutoff) {
            return { ...latest, status: 'failed', phase: latest.phase ?? 'stalled' };
        }
        return latest;
    }
    async getIndexStats() {
        return this.indexService.getIndexStats();
    }
    async recreateIndex() {
        return this.publishSync({ kind: 'recreate-index' });
    }
    async refreshCopartBid(lotNumber) {
        return this.searchService.refreshHighBid(lotNumber);
    }
    async discardAuction(source, sourceId, dto, userId) {
        return this.searchService.discardListing(sourceId, dto.discarded, dto.reason, userId ?? null);
    }
    async upsertAnalysisSnapshot(sourceId, dto) {
        return this.searchService.upsertAnalysisSnapshot(sourceId, dto.type, dto.data);
    }
    async getAnalysisSnapshots(sourceId) {
        return this.searchService.getAnalysisSnapshots(sourceId);
    }
    async findBySourceId(source, sourceId) {
        const result = await this.searchService.findBySourceId(source, sourceId);
        if (!result) {
            return { error: 'Auction not found', source, sourceId };
        }
        return result;
    }
    async publishSync(msg) {
        const queued = await this.rabbitMQ.publish(rabbitmq_1.AUCTION_SYNC_TRIGGER_QUEUE, msg);
        return { queued, kind: msg.kind };
    }
};
exports.AuctionSearchController = AuctionSearchController;
__decorate([
    (0, common_1.Get)('search'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Search auctions from all sources',
        description: 'Unified search across Copart and MarketCheck auction listings with filters and aggregations',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results with pagination and optional aggregations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_auctions_dto_1.SearchAuctionsDto]),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('filters'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available filter options',
        description: 'Returns distinct values for all filterable fields. Supports cascading filters - pass make to filter models, pass make+model to filter trims.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Filter options (aggregations)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_auctions_dto_1.SearchAuctionsDto]),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "getFilterOptions", null);
__decorate([
    (0, common_1.Get)('get-gallery/copart/:id'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get gallery images for a Copart listing',
        description: 'Fetches images from Copart API and returns thumbnail and high-res URLs for gallery display',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Auction listing ID (UUID)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Gallery images with thumbnail and full-size URLs' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Auction listing not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('bypass')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "getCopartGallery", null);
__decorate([
    (0, common_1.Get)('last-sync'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get last Copart sync timestamp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Last sync info' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "getLastSync", null);
__decorate([
    (0, common_1.Post)('import/copart'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, swagger_1.ApiOperation)({
        summary: 'Queue full Copart import (CSV → DB → OpenSearch)',
        description: 'Publishes a trigger to the data-sync worker. Returns immediately; check sync stats to follow progress.',
    }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Sync queued' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "importCopart", null);
__decorate([
    (0, common_1.Post)('import/recreate'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, swagger_1.ApiOperation)({
        summary: 'Queue index recreate + full Copart import',
        description: 'Publishes a destructive trigger: drop the OpenSearch index, then re-import everything from Copart.',
    }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Recreate + import queued' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "recreateAndImport", null);
__decorate([
    (0, common_1.Post)('sync/all'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, swagger_1.ApiOperation)({
        summary: 'Queue reindex of all sources to OpenSearch',
    }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Reindex queued' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "syncAll", null);
__decorate([
    (0, common_1.Post)('sync/copart'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, swagger_1.ApiOperation)({
        summary: 'Queue reindex of all Copart listings to OpenSearch',
    }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Reindex queued' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "syncCopart", null);
__decorate([
    (0, common_1.Get)('sync/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get sync statistics',
        description: 'Returns counts of listings in PostgreSQL and OpenSearch',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "getSyncStats", null);
__decorate([
    (0, common_1.Get)('sync/status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get live sync status for the Copart feed',
        description: 'Returns the active (running) SyncRun if one exists, otherwise the most recent one. ' +
            'Fields: status, phase, progress (0-100), processedRows, totalRows, startedAt, finishedAt, ' +
            'durationMs, bytesDownloaded, rowsParsed, rowsUpserted, rowsStaleMarked.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current or last Copart sync status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "getSyncStatus", null);
__decorate([
    (0, common_1.Get)('index/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get index statistics',
        description: 'Returns OpenSearch index statistics (document count, size)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Index statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "getIndexStats", null);
__decorate([
    (0, common_1.Post)('index/recreate'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, swagger_1.ApiOperation)({
        summary: 'Queue OpenSearch index recreate',
        description: 'Publishes a destructive trigger: drop and recreate the index. No reimport.',
    }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Recreate queued' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "recreateIndex", null);
__decorate([
    (0, common_1.Post)('copart/:lotNumber/refresh-bid'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh current high bid for a Copart lot',
        description: 'Scrapes autobidmaster.com for the given lot number, extracts the qa_current_bid value, persists it to the auction listing, and reindexes the doc.',
    }),
    (0, swagger_1.ApiParam)({ name: 'lotNumber', description: 'Copart lot number' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refreshed high bid' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Auction listing not found' }),
    __param(0, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "refreshCopartBid", null);
__decorate([
    (0, common_1.Patch)(':source/:sourceId/discard'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Set or clear the discarded state for an auction listing',
        description: 'Staff-only. Marks a lot as discarded (with optional reason) or clears the flag. Only copart lots are persisted in Postgres; IAAI lots return 404.',
    }),
    (0, swagger_1.ApiParam)({ name: 'source', enum: ['copart', 'iaai'] }),
    (0, swagger_1.ApiParam)({ name: 'sourceId', description: 'Lot number (Copart)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated discard state' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Auction listing not found' }),
    __param(0, (0, common_1.Param)('source')),
    __param(1, (0, common_1.Param)('sourceId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, discard_auction_dto_1.DiscardAuctionDto, String]),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "discardAuction", null);
__decorate([
    (0, common_1.Put)(':source/:sourceId/analysis-snapshot'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Upsert an analysis snapshot for an auction listing',
        description: 'Staff-only. Persists a staff-generated live analysis (MarketCheck / Comparables / Auction History) so read-only views can show it without re-calling paid external APIs.',
    }),
    (0, swagger_1.ApiParam)({ name: 'source', enum: ['copart', 'iaai'] }),
    (0, swagger_1.ApiParam)({ name: 'sourceId', description: 'Lot number (numeric)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Snapshot upserted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'sourceId is not numeric' }),
    __param(0, (0, common_1.Param)('sourceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_analysis_snapshot_dto_1.UpsertAnalysisSnapshotDto]),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "upsertAnalysisSnapshot", null);
__decorate([
    (0, common_1.Get)(':source/:sourceId/analysis-snapshot'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get persisted analysis snapshots for an auction listing',
        description: 'Staff-only. Returns previously-saved analysis snapshots keyed by type so the auction detail view can restore them on reload.',
    }),
    (0, swagger_1.ApiParam)({ name: 'source', enum: ['copart', 'iaai'] }),
    (0, swagger_1.ApiParam)({ name: 'sourceId', description: 'Lot number (numeric)' }),
    __param(0, (0, common_1.Param)('sourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "getAnalysisSnapshots", null);
__decorate([
    (0, common_1.Get)(':source/:sourceId'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a single auction by source and ID',
        description: 'Retrieve an auction by its source (copart/iaai) and source ID (lotNumber/externalId)',
    }),
    (0, swagger_1.ApiParam)({ name: 'source', enum: ['copart', 'iaai'] }),
    (0, swagger_1.ApiParam)({ name: 'sourceId', description: 'Lot number (Copart) or External ID (IAAI)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Auction details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Auction not found' }),
    __param(0, (0, common_1.Param)('source')),
    __param(1, (0, common_1.Param)('sourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuctionSearchController.prototype, "findBySourceId", null);
exports.AuctionSearchController = AuctionSearchController = __decorate([
    (0, swagger_1.ApiTags)('Auctions (OpenSearch)'),
    (0, common_1.Controller)('auctions'),
    __metadata("design:paramtypes", [auction_search_service_1.AuctionSearchService,
        opensearch_1.AuctionSyncService,
        opensearch_1.AuctionIndexService,
        rabbitmq_1.RabbitMQService,
        prisma_1.PrismaService])
], AuctionSearchController);
//# sourceMappingURL=auction-search.controller.js.map