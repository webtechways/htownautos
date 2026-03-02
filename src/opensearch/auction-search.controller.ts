import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuctionSearchService } from './auction-search.service';
import { AuctionSyncService } from './auction-sync.service';
import { AuctionIndexService } from './auction-index.service';
import { CopartImportService } from './copart-import.service';
import { SearchAuctionsDto } from './dto/search-auctions.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Auctions (OpenSearch)')
@Controller('auctions')
export class AuctionSearchController {
  constructor(
    private readonly searchService: AuctionSearchService,
    private readonly syncService: AuctionSyncService,
    private readonly indexService: AuctionIndexService,
    private readonly importService: CopartImportService,
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

  // === IMPORT ENDPOINTS ===

  @Post('import/copart')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Import Copart CSV → PostgreSQL → OpenSearch',
    description: 'Downloads CSV from COPART_DATA URL, loads into staging via COPY, maps to auction_listings, then reindexes OpenSearch',
  })
  @ApiResponse({ status: 200, description: 'Import results: downloaded bytes, inserted rows, indexed docs' })
  async importCopart() {
    return this.importService.importFromCopartUrl();
  }

  // === ADMIN / SYNC ENDPOINTS ===

  @Post('sync/all')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync all auctions to OpenSearch',
    description: 'Full sync of all Copart and MarketCheck listings from PostgreSQL to OpenSearch',
  })
  @ApiResponse({ status: 200, description: 'Sync results' })
  async syncAll() {
    return this.syncService.syncAll();
  }

  @Post('sync/copart')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync all Copart listings to OpenSearch',
    description: 'Full sync of all Copart listings from PostgreSQL to OpenSearch',
  })
  @ApiResponse({ status: 200, description: 'Sync results' })
  async syncCopart() {
    return this.syncService.syncAllCopart();
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recreate the auction index',
    description: 'Deletes and recreates the OpenSearch index (WARNING: deletes all indexed data)',
  })
  @ApiResponse({ status: 200, description: 'Index recreated' })
  async recreateIndex() {
    const result = await this.indexService.recreateIndex();
    return { success: result, message: result ? 'Index recreated successfully' : 'Failed to recreate index' };
  }
}
