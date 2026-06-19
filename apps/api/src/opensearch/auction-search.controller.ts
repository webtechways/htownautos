import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuctionSearchService } from './auction-search.service';
import { AuctionSyncService, AuctionIndexService } from '@htownautos/opensearch';
import {
  RabbitMQService,
  AUCTION_SYNC_TRIGGER_QUEUE,
  type AuctionSyncTriggerMessage,
} from '@htownautos/rabbitmq';
import { SearchAuctionsDto } from './dto/search-auctions.dto';
import { DiscardAuctionDto } from './dto/discard-auction.dto';
import { ClerkJwtGuard, CurrentUser, Public } from '@htownautos/auth';

/**
 * Heavy sync work (CSV import, full reindex, index recreation) is owned by the
 * `data-sync` worker. This api only publishes a trigger message to RabbitMQ so
 * the user gets an immediate response and the api process never blocks on a
 * minutes-long pipeline.
 *
 * Read-only endpoints (`/sync/stats`, `/index/stats`) stay here because they
 * are cheap.
 */
@ApiTags('Auctions (OpenSearch)')
@Controller('auctions')
export class AuctionSearchController {
  constructor(
    private readonly searchService: AuctionSearchService,
    private readonly syncService: AuctionSyncService,
    private readonly indexService: AuctionIndexService,
    private readonly rabbitMQ: RabbitMQService,
  ) {}

  @Get('search')
  @Public()
  @ApiOperation({
    summary: 'Search auctions from all sources',
    description: 'Unified search across Copart and MarketCheck auction listings with filters and aggregations',
  })
  @ApiResponse({ status: 200, description: 'Search results with pagination and optional aggregations' })
  async search(@Query() dto: SearchAuctionsDto) {
    return this.searchService.search(dto);
  }

  @Get('filters')
  @Public()
  @ApiOperation({
    summary: 'Get available filter options',
    description: 'Returns distinct values for all filterable fields. Supports cascading filters - pass make to filter models, pass make+model to filter trims.',
  })
  @ApiResponse({ status: 200, description: 'Filter options (aggregations)' })
  async getFilterOptions(@Query() dto: SearchAuctionsDto) {
    return this.searchService.getFilterOptions(dto);
  }

  @Get('get-gallery/copart/:id')
  @Public()
  @ApiOperation({
    summary: 'Get gallery images for a Copart listing',
    description: 'Fetches images from Copart API and returns thumbnail and high-res URLs for gallery display',
  })
  @ApiParam({ name: 'id', description: 'Auction listing ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Gallery images with thumbnail and full-size URLs' })
  @ApiResponse({ status: 404, description: 'Auction listing not found' })
  async getCopartGallery(@Param('id') id: string, @Query('bypass') bypass?: string) {
    if (bypass === 'true') {
      return this.searchService.getCopartGalleryRaw(id);
    }
    return this.searchService.getCopartGallery(id);
  }

  @Get('last-sync')
  @Public()
  @ApiOperation({ summary: 'Get last Copart sync timestamp' })
  @ApiResponse({ status: 200, description: 'Last sync info' })
  async getLastSync() {
    return this.searchService.getLastSyncTime();
  }

  // === SYNC TRIGGERS — published to RabbitMQ, executed by data-sync ===

  @Post('import/copart')
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Queue full Copart import (CSV → DB → OpenSearch)',
    description: 'Publishes a trigger to the data-sync worker. Returns immediately; check sync stats to follow progress.',
  })
  @ApiResponse({ status: 202, description: 'Sync queued' })
  async importCopart() {
    return this.publishSync({ kind: 'copart-import' });
  }

  @Post('import/recreate')
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Queue index recreate + full Copart import',
    description: 'Publishes a destructive trigger: drop the OpenSearch index, then re-import everything from Copart.',
  })
  @ApiResponse({ status: 202, description: 'Recreate + import queued' })
  async recreateAndImport() {
    return this.publishSync({ kind: 'copart-import-recreate' });
  }

  @Post('sync/all')
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Queue reindex of all sources to OpenSearch',
  })
  @ApiResponse({ status: 202, description: 'Reindex queued' })
  async syncAll() {
    return this.publishSync({ kind: 'reindex-all' });
  }

  @Post('sync/copart')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Queue reindex of all Copart listings to OpenSearch',
  })
  @ApiResponse({ status: 202, description: 'Reindex queued' })
  async syncCopart() {
    return this.publishSync({ kind: 'reindex-copart' });
  }

  @Get('sync/stats')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get sync statistics',
    description: 'Returns counts of listings in PostgreSQL and OpenSearch',
  })
  @ApiResponse({ status: 200, description: 'Sync statistics' })
  async getSyncStats() {
    return this.syncService.getSyncStats();
  }

  @Get('index/stats')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get index statistics',
    description: 'Returns OpenSearch index statistics (document count, size)',
  })
  @ApiResponse({ status: 200, description: 'Index statistics' })
  async getIndexStats() {
    return this.indexService.getIndexStats();
  }

  @Post('index/recreate')
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Queue OpenSearch index recreate',
    description: 'Publishes a destructive trigger: drop and recreate the index. No reimport.',
  })
  @ApiResponse({ status: 202, description: 'Recreate queued' })
  async recreateIndex() {
    return this.publishSync({ kind: 'recreate-index' });
  }

  @Post('copart/:lotNumber/refresh-bid')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh current high bid for a Copart lot',
    description:
      'Scrapes autobidmaster.com for the given lot number, extracts the qa_current_bid value, persists it to the auction listing, and reindexes the doc.',
  })
  @ApiParam({ name: 'lotNumber', description: 'Copart lot number' })
  @ApiResponse({ status: 200, description: 'Refreshed high bid' })
  @ApiResponse({ status: 404, description: 'Auction listing not found' })
  async refreshCopartBid(@Param('lotNumber') lotNumber: string) {
    return this.searchService.refreshHighBid(lotNumber);
  }

  @Patch(':source/:sourceId/discard')
  @UseGuards(ClerkJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Set or clear the discarded state for an auction listing',
    description: 'Staff-only. Marks a lot as discarded (with optional reason) or clears the flag. Only copart lots are persisted in Postgres; IAAI lots return 404.',
  })
  @ApiParam({ name: 'source', enum: ['copart', 'iaai'] })
  @ApiParam({ name: 'sourceId', description: 'Lot number (Copart)' })
  @ApiResponse({ status: 200, description: 'Updated discard state' })
  @ApiResponse({ status: 404, description: 'Auction listing not found' })
  async discardAuction(
    @Param('source') source: 'copart' | 'iaai',
    @Param('sourceId') sourceId: string,
    @Body() dto: DiscardAuctionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.searchService.discardListing(sourceId, dto.discarded, dto.reason, userId ?? null);
  }

  // Wildcard route — MUST be last to avoid catching static routes
  @Get(':source/:sourceId')
  @Public()
  @ApiOperation({
    summary: 'Get a single auction by source and ID',
    description: 'Retrieve an auction by its source (copart/iaai) and source ID (lotNumber/externalId)',
  })
  @ApiParam({ name: 'source', enum: ['copart', 'iaai'] })
  @ApiParam({ name: 'sourceId', description: 'Lot number (Copart) or External ID (IAAI)' })
  @ApiResponse({ status: 200, description: 'Auction details' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  async findBySourceId(
    @Param('source') source: 'copart' | 'iaai',
    @Param('sourceId') sourceId: string,
  ) {
    const result = await this.searchService.findBySourceId(source, sourceId);
    if (!result) {
      return { error: 'Auction not found', source, sourceId };
    }
    return result;
  }

  private async publishSync(
    msg: AuctionSyncTriggerMessage,
  ): Promise<{ queued: boolean; kind: string }> {
    const queued = await this.rabbitMQ.publish(AUCTION_SYNC_TRIGGER_QUEUE, msg);
    return { queued, kind: msg.kind };
  }
}
