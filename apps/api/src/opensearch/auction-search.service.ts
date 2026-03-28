import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OpenSearchService, AUCTION_INDEX_NAME } from '@htownautos/opensearch';
import type { UnifiedAuction, AuctionAggregations, AuctionSearchResult } from '@htownautos/opensearch';
import { PrismaService } from '@htownautos/prisma';
import { RabbitMQService } from '@htownautos/rabbitmq';
import { ProxyService } from '@htownautos/common';
import { SearchAuctionsDto } from './dto/search-auctions.dto';

// Copart Images API Response types
interface CopartImageLink {
  url: string;
  isThumbNail: boolean;
  isHdImage: boolean;
  isBlurred: boolean;
  isEngineSound: boolean;
}

interface CopartImageSequence {
  sequence: number;
  link: CopartImageLink[];
}

interface CopartImagesApiResponse {
  imgCount: number;
  lotImages: CopartImageSequence[];
}

// Our simplified gallery response
export interface GalleryImage {
  sequence: number;
  thumbnail: string;  // thb image
  fullSize: string;   // hrs image (high resolution)
}

export interface GalleryResponse {
  lotNumber: string;
  imageCount: number;
  images: GalleryImage[];
}

// Internal cache structure stored in DB (public S3 URLs)
interface GalleryCacheImage {
  sequence: number;
  thumbnail: string;
  fullSize: string;
}

interface GalleryCacheData {
  lotNumber: string;
  imageCount: number;
  images: GalleryCacheImage[];
}

const GALLERY_CACHE_TTL_DAYS = 30;

export const GALLERY_CACHE_QUEUE = 'gallery.cache';

@Injectable()
export class AuctionSearchService {
  private readonly logger = new Logger(AuctionSearchService.name);

  constructor(
    private readonly openSearchService: OpenSearchService,
    private readonly prisma: PrismaService,
    private readonly rabbitMQ: RabbitMQService,
    private readonly proxyService: ProxyService,
  ) {}

  async search(dto: SearchAuctionsDto): Promise<AuctionSearchResult> {
    const { page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = dto;
    const from = (page - 1) * limit;

    // If hasCarfaxReport filter is active, get listing IDs with carfax reports from DB
    let carfaxSourceIds: string[] | undefined;
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

    // Build query
    const query = this.buildQuery(dto, carfaxSourceIds);

    // Build sort
    const sort = this.buildSort(sortBy, sortOrder);

    // Build aggregations if requested
    const aggs = dto.includeAggregations ? this.buildAggregations() : undefined;

    const searchBody: any = {
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
      const result = await this.openSearchService.search(AUCTION_INDEX_NAME, searchBody);

      const total = result.hits.total.value || 0;
      const totalPages = Math.ceil(total / limit);

      const data: UnifiedAuction[] = result.hits.hits.map((hit: any) => hit._source);

      const response: AuctionSearchResult = {
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
        response.aggregations = this.parseAggregations(result.aggregations);
      }

      return response;
    } catch (error) {
      this.logger.error(`Search error: ${error.message}`);
      throw error;
    }
  }

  private getTodayAsInt(): number {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return parseInt(`${y}${m}${d}`, 10);
  }

  private buildQuery(dto: SearchAuctionsDto, carfaxSourceIds?: string[]): any {
    const must: any[] = [];
    const filter: any[] = [];

    // Always exclude already-auctioned items:
    // keep listings where saleDate is null/missing, 0 (no date yet), OR saleDate >= today
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

    // Full text search
    if (dto.search) {
      must.push({
        multi_match: {
          query: dto.search,
          fields: ['vin^3', 'make^2', 'model^2', 'damageDescription', 'heading'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Source filter
    if (dto.source && dto.source.length > 0) {
      filter.push({ terms: { source: dto.source } });
    }

    // Source IDs filter (for favorites by lot number)
    if (dto.sourceIds) {
      const ids = dto.sourceIds.split(',').map(id => id.trim());
      filter.push({ terms: { sourceId: ids } });
    }

    // IDs filter (for favorites by UUID)
    if (dto.ids) {
      const ids = dto.ids.split(',').map(id => id.trim());
      filter.push({ terms: { id: ids } });
    }

    // VIN filter
    if (dto.vin) {
      filter.push({ term: { vin: dto.vin.toUpperCase() } });
    }

    // Year filters
    if (dto.year) {
      filter.push({ term: { year: dto.year } });
    } else if (dto.yearMin || dto.yearMax) {
      const rangeQuery: any = {};
      if (dto.yearMin) rangeQuery.gte = dto.yearMin;
      if (dto.yearMax) rangeQuery.lte = dto.yearMax;
      filter.push({ range: { year: rangeQuery } });
    }

    // Make filter
    if (dto.make && dto.make.length > 0) {
      filter.push({
        terms: { 'make.keyword': dto.make.map(m => m.toLowerCase()) },
      });
    }

    // Model filter
    if (dto.model && dto.model.length > 0) {
      filter.push({
        terms: { 'model.keyword': dto.model.map(m => m.toLowerCase()) },
      });
    }

    // Body type filter
    if (dto.bodyType && dto.bodyType.length > 0) {
      filter.push({
        terms: { bodyType: dto.bodyType.map(b => b.toLowerCase()) },
      });
    }

    // Trim filter
    if (dto.trim && dto.trim.length > 0) {
      filter.push({
        terms: { 'trim': dto.trim },
      });
    }

    // Yard name filter
    if (dto.yardName && dto.yardName.length > 0) {
      filter.push({
        terms: { yardName: dto.yardName },
      });
    }

    // Seller name filter
    if (dto.sellerName && dto.sellerName.length > 0) {
      filter.push({
        terms: { sellerName: dto.sellerName },
      });
    }

    // Exclude unknown sellers
    if (dto.excludeUnknownSellers) {
      filter.push({ exists: { field: 'sellerName' } });
    }

    // Transmission filter
    if (dto.transmission) {
      filter.push({ term: { transmission: dto.transmission.toLowerCase() } });
    }

    // Fuel type filter
    if (dto.fuelType) {
      filter.push({ term: { fuelType: dto.fuelType.toLowerCase() } });
    }

    // Drivetrain filter
    if (dto.drivetrain) {
      filter.push({ term: { drivetrain: dto.drivetrain.toLowerCase() } });
    }

    // Location state filter
    if (dto.locationState && dto.locationState.length > 0) {
      filter.push({ terms: { locationState: dto.locationState } });
    }

    // Odometer range
    if (dto.odometerMin !== undefined || dto.odometerMax !== undefined) {
      const rangeQuery: any = {};
      if (dto.odometerMin !== undefined) rangeQuery.gte = dto.odometerMin;
      if (dto.odometerMax !== undefined) rangeQuery.lte = dto.odometerMax;
      filter.push({ range: { odometer: rangeQuery } });
    }

    // Odometer brand filter
    if (dto.odometerBrand) {
      filter.push({ term: { odometerBrand: dto.odometerBrand } });
    }

    // === COPART SPECIFIC FILTERS ===

    // Damage description filter
    if (dto.damageDescription && dto.damageDescription.length > 0) {
      filter.push({
        terms: { 'damageDescription.keyword': dto.damageDescription.map(d => d.toLowerCase()) },
      });
    }

    // Sale status filter
    if (dto.saleStatus) {
      filter.push({ term: { saleStatus: dto.saleStatus.toLowerCase() } });
    }

    // Sale title type filter
    if (dto.saleTitleType && dto.saleTitleType.length > 0) {
      filter.push({
        terms: { saleTitleType: dto.saleTitleType.map(t => t.toLowerCase()) },
      });
    }

    // Has keys filter
    if (dto.hasKeys) {
      filter.push({ term: { hasKeys: dto.hasKeys.toLowerCase() } });
    }

    // Runs/Drives filter
    if (dto.runsDrives) {
      filter.push({ term: { runsDrives: dto.runsDrives } });
    }

    // Lot condition code filter
    if (dto.lotCondCode) {
      filter.push({ term: { lotCondCode: dto.lotCondCode } });
    }

    // Wholesale filter
    if (dto.wholesale) {
      filter.push({ term: { wholesale: dto.wholesale.toLowerCase() } });
    }

    // Sale light filter
    if (dto.saleLight && dto.saleLight.length > 0) {
      filter.push({
        terms: { saleLight: dto.saleLight.map(s => s.toLowerCase()) },
      });
    }

    // Price range (estRetailValue)
    if (dto.priceMin !== undefined || dto.priceMax !== undefined) {
      const rangeQuery: any = {};
      if (dto.priceMin !== undefined) rangeQuery.gte = dto.priceMin;
      if (dto.priceMax !== undefined) rangeQuery.lte = dto.priceMax;
      filter.push({ range: { estRetailValue: rangeQuery } });
    }

    // Sale date range
    if (dto.saleDateFrom || dto.saleDateTo) {
      const rangeQuery: any = {};
      if (dto.saleDateFrom) rangeQuery.gte = dto.saleDateFrom;
      if (dto.saleDateTo) rangeQuery.lte = dto.saleDateTo;
      filter.push({ range: { saleDate: rangeQuery } });
    }

    // === MARKETCHECK SPECIFIC FILTERS ===

    // Carfax clean title
    if (dto.carfaxCleanTitle !== undefined) {
      filter.push({ term: { carfaxCleanTitle: dto.carfaxCleanTitle } });
    }

    // Carfax 1 owner
    if (dto.carfax1Owner !== undefined) {
      filter.push({ term: { carfax1Owner: dto.carfax1Owner } });
    }

    // Days on market max
    if (dto.domMax !== undefined) {
      filter.push({ range: { dom: { lte: dto.domMax } } });
    }

    // Carfax report existence filter (IDs resolved from PostgreSQL)
    if (carfaxSourceIds && carfaxSourceIds.length > 0) {
      filter.push({ terms: { sourceId: carfaxSourceIds } });
    }

    // Build final query
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

  private buildSort(sortBy: string, sortOrder: 'asc' | 'desc'): any[] {
    const sortField = this.getSortField(sortBy);
    return [
      { [sortField]: { order: sortOrder, unmapped_type: 'long' } },
      { _score: { order: 'desc' } },
    ];
  }

  private getSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      year: 'year',
      make: 'make.keyword',
      odometer: 'odometer',
      saleDate: 'saleDate',
      highBid: 'highBid',
      estRetailValue: 'estRetailValue',
      createdAt: 'createdAt',
      dom: 'dom',
      locationState: 'locationState',
      saleTitleType: 'saleTitleType',
    };
    return fieldMap[sortBy] || 'createdAt';
  }

  private buildAggregations(): any {
    return {
      sources: {
        terms: { field: 'source', size: 10 },
      },
      makes: {
        terms: { field: 'make.raw', size: 50 },
      },
      models: {
        terms: { field: 'model.raw', size: 100 },
      },
      trims: {
        terms: { field: 'trim', size: 100 },
      },
      years: {
        terms: { field: 'year', size: 30, order: { _key: 'desc' } },
      },
      states: {
        terms: { field: 'locationState', size: 60 },
      },
      bodyTypes: {
        terms: { field: 'bodyType', size: 20 },
      },
      transmissions: {
        terms: { field: 'transmission', size: 10 },
      },
      fuelTypes: {
        terms: { field: 'fuelType', size: 10 },
      },
      damageTypes: {
        terms: { field: 'damageDescription.raw', size: 30 },
      },
      saleStatuses: {
        terms: { field: 'saleStatus', size: 10 },
      },
      titleTypes: {
        terms: { field: 'saleTitleType', size: 20 },
      },
      yards: {
        terms: { field: 'yardName', size: 100 },
      },
      sellers: {
        terms: { field: 'sellerName', size: 200 },
      },
      lotCondCodes: {
        terms: { field: 'lotCondCode', size: 20 },
      },
      runsDrivesOptions: {
        terms: { field: 'runsDrives', size: 10 },
      },
      saleLights: {
        terms: { field: 'saleLight', size: 10 },
      },
    };
  }

  private parseAggregations(aggs: any): AuctionAggregations {
    const parseBuckets = (buckets: any[]): Array<{ key: any; count: number }> => {
      return (buckets || []).map((bucket) => ({
        key: bucket.key,
        count: bucket.doc_count,
      }));
    };

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
      titleTypes: parseBuckets(aggs.titleTypes?.buckets),
      yards: parseBuckets(aggs.yards?.buckets),
      sellers: parseBuckets(aggs.sellers?.buckets),
      lotCondCodes: parseBuckets(aggs.lotCondCodes?.buckets),
      runsDrivesOptions: parseBuckets(aggs.runsDrivesOptions?.buckets),
      saleLights: parseBuckets(aggs.saleLights?.buckets),
    };
  }

  /**
   * Get filter options (distinct values) for building UI filters
   * Supports cascading filters - when make is selected, models are filtered to that make
   */
  async getFilterOptions(dto?: SearchAuctionsDto): Promise<AuctionAggregations> {
    // Build query based on current filter selections for cascading
    const query = dto ? this.buildQuery(dto) : { match_all: {} };

    const searchBody: any = {
      size: 0,
      query,
      aggs: this.buildAggregations(),
    };

    try {
      const result = await this.openSearchService.search(AUCTION_INDEX_NAME, searchBody);
      return this.parseAggregations(result.aggregations);
    } catch (error) {
      this.logger.error(`Error getting filter options: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a single auction by ID
   */
  async findById(id: string): Promise<UnifiedAuction | null> {
    try {
      const client = this.openSearchService.getClient();
      const result = await client.get({
        index: AUCTION_INDEX_NAME,
        id,
      });
      return (result.body._source as UnifiedAuction) ?? null;
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get auction by source and sourceId
   */
  async findBySourceId(source: 'copart' | 'iaai', sourceId: string): Promise<UnifiedAuction | null> {
    const id = `${source}_${sourceId}`;
    return this.findById(id);
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

  /** Bypass: fetch directly from Copart API, no cache read/write */
  async getCopartGalleryRaw(lotNumberStr: string): Promise<GalleryResponse> {
    const images = await this.fetchCopartImages(lotNumberStr);
    return { lotNumber: lotNumberStr, imageCount: images.length, images };
  }

  /**
   * Get gallery images for a Copart listing.
   * - If galleryCache exists in DB → return public S3 URLs (no Copart call)
   * - If no cache → fetch from Copart, return immediately, cache to S3 in background
   */
  async getCopartGallery(lotNumberStr: string): Promise<GalleryResponse> {
    const listing = await this.prisma.auctionListing.findUnique({
      where: { lotNumber: BigInt(lotNumberStr) },
      select: { lotNumber: true, images: true, galleryCache: true, galleryCachedAt: true },
    });

    if (!listing) {
      throw new NotFoundException(`Auction listing with lot number ${lotNumberStr} not found`);
    }

    const lotNumber = listing.lotNumber.toString();

    // --- CACHE HIT: check TTL and return public S3 URLs ---
    if (listing.galleryCache && listing.galleryCachedAt) {
      const ageMs = Date.now() - listing.galleryCachedAt.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      if (ageDays < GALLERY_CACHE_TTL_DAYS) {
        try {
          const cached: GalleryCacheData = JSON.parse(listing.galleryCache);
          this.logger.log(`[Gallery] Cache HIT for lot ${lotNumber} (${cached.imageCount} images, ${ageDays.toFixed(1)}d old)`);
          return cached;
        } catch {
          this.logger.warn(`[Gallery] Invalid cache JSON for lot ${lotNumber}, refetching`);
        }
      } else {
        this.logger.log(`[Gallery] Cache EXPIRED for lot ${lotNumber} (${ageDays.toFixed(1)}d old), refetching`);
      }
    }

    // --- CACHE MISS: fetch from Copart, publish cache job to RabbitMQ ---
    this.logger.log(`[Gallery] Cache MISS for lot ${lotNumber}, fetching from Copart`);
    const images = await this.fetchCopartImages(lotNumber);

    // Publish to RabbitMQ for async caching (fire-and-forget)
    if (images.length > 0) {
      this.rabbitMQ.publish(GALLERY_CACHE_QUEUE, { lotNumber, images }).catch(() => {});
    }

    return { lotNumber, imageCount: images.length, images };
  }

  /** Fetch and parse images from Copart API */
  private async fetchCopartImages(lotNumber: string): Promise<GalleryImage[]> {
    const apiUrl = `https://inventoryv2.copart.io/v1/lotImages/${lotNumber}`;

    try {
      const response = await this.proxyService.fetchViaProxy(apiUrl);

      if (!response.ok) {
        this.logger.warn(`[Gallery] Copart API returned ${response.status} for lot ${lotNumber}`);
        return [];
      }

      const data: CopartImagesApiResponse = await response.json();

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
    } catch (error) {
      this.logger.error(`[Gallery] Error fetching Copart API for lot ${lotNumber}: ${error.message}`);
      return [];
    }
  }

  /** Cleanup expired gallery caches from DB (runs daily at 3am) */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
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
    } catch (err) {
      this.logger.warn(`[Gallery] Failed to cleanup expired caches: ${err.message}`);
    }
  }
}
