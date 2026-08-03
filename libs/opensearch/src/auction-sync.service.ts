import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { OpenSearchService } from './opensearch.service';
import { AUCTION_INDEX_NAME } from './auction-index.service';
import { UnifiedAuction } from './dto/unified-auction.interface';
import {
  deriveSellerCategory,
  parseEngineSizeL,
  geocodeZip,
  normalizeToken,
} from '@htownautos/common';

@Injectable()
export class AuctionSyncService {
  private readonly logger = new Logger(AuctionSyncService.name);
  private readonly BATCH_SIZE = 500;

  constructor(
    private readonly prisma: PrismaService,
    private readonly openSearchService: OpenSearchService,
  ) {}

  /**
   * Full sync: Index all Copart listings from PostgreSQL
   */
  async syncAllCopart(): Promise<{ success: number; failed: number; total: number }> {
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

      const result = await this.openSearchService.bulkIndex(AUCTION_INDEX_NAME, documents);
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

  /**
   * Full sync: Index all listings
   */
  async syncAll(): Promise<{
    copart: { success: number; failed: number; total: number };
  }> {
    const copart = await this.syncAllCopart();
    return { copart };
  }

  /**
   * Index a single Copart listing (for incremental updates)
   */
  async indexCopartListing(listing: any): Promise<boolean> {
    const document = this.mapCopartToUnified(listing);
    return this.openSearchService.indexDocument(
      AUCTION_INDEX_NAME,
      `copart_${listing.lotNumber.toString()}`,
      document,
    );
  }

  /**
   * Index multiple Copart listings (for batch incremental updates)
   */
  async indexCopartListings(listings: any[]): Promise<{ success: number; failed: number }> {
    if (listings.length === 0) {
      return { success: 0, failed: 0 };
    }

    const documents = listings.map((listing) => ({
      id: `copart_${listing.lotNumber.toString()}`,
      body: this.mapCopartToUnified(listing),
    }));

    return this.openSearchService.bulkIndex(AUCTION_INDEX_NAME, documents);
  }

  /**
   * Delete a Copart listing from index
   */
  async deleteCopartListing(lotNumber: string): Promise<boolean> {
    return this.openSearchService.deleteDocument(
      AUCTION_INDEX_NAME,
      `copart_${lotNumber}`,
    );
  }

  /**
   * Map Copart listing to unified format
   */
  private mapCopartToUnified(listing: any): UnifiedAuction {
    const lotNumber = listing.lotNumber.toString();

    // Images field is stored as JSON string array or API URL
    // Parse if it's a valid JSON array, otherwise empty
    let images: string[] = [];
    let mainImage: string | null = null;

    if (listing.images) {
      try {
        // Try to parse as JSON array
        const parsed = JSON.parse(listing.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          images = parsed;
          mainImage = parsed[0];
        }
      } catch {
        // Not valid JSON (likely API URL), ignore
      }
    }

    // Format sale date if available
    let saleDateFormatted: string | null = null;
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
      // Identifiers
      id: lotNumber,
      source: 'copart',
      sourceId: lotNumber,

      // Vehicle Info
      vin: listing.vin || null,
      year: listing.year || null,
      make: listing.make || null,
      // Use modelDetail if available (more specific), otherwise fall back to modelGroup
      model: listing.modelDetail || listing.modelGroup || null,
      trim: listing.trim || null,
      bodyType: listing.bodyStyle || null,
      color: listing.color || null,
      interiorColor: null,
      // Canonical filter values — prefer the DB-persisted column, fall back to the
      // deterministic normalization (alias merges live in the DB column).
      makeCanonical: listing.makeCanonical || normalizeToken(listing.make),
      modelCanonical: listing.modelCanonical || normalizeToken(listing.modelGroup),
      trimCanonical: listing.trimCanonical || normalizeToken(listing.trim),
      colorCanonical: listing.colorCanonical || normalizeToken(listing.color),

      // Mechanical
      engine: listing.engine || null,
      transmission: listing.transmission || null,
      fuelType: listing.fuelType || null,
      drivetrain: listing.drive || null,
      cylinders: listing.cylinders || null,
      odometer: listing.odometer ? Number(listing.odometer) : null,
      odometerBrand: listing.odometerBrand || null,

      // Location
      locationCity: listing.locationCity || null,
      locationState: listing.locationState || null,
      locationZip: listing.locationZip || null,
      locationCountry: listing.locationCountry || null,

      // Images - use actual URLs from database
      images,
      mainImage,

      // Timestamps
      createdAt: listing.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: listing.updatedAt?.toISOString() || null,
      indexedAt: new Date().toISOString(),

      // Copart Specific: Damage
      damageDescription: listing.damageDescription || null,
      secondaryDamage: listing.secondaryDamage || null,

      // Copart Specific: Sale Info
      saleDate: listing.saleDate || null,
      saleDateFormatted,
      dayOfWeek: listing.dayOfWeek || null,
      saleTime: listing.saleTime || null,
      saleStatus: listing.saleStatus || null,

      // Copart Specific: Title & Condition
      saleTitleState: listing.saleTitleState || null,
      saleTitleType: listing.saleTitleType || null,
      hasKeys: listing.hasKeys || null,
      runsDrives: listing.runsDrives || null,
      lotCondCode: listing.lotCondCode || null,

      // Copart Specific: Wholesale
      wholesale: listing.wholesale || null,
      saleLight: listing.saleLight || null,

      // Copart Specific: Pricing
      highBid: listing.highBid ? Number(listing.highBid) : null,
      buyItNowPrice: listing.buyItNowPrice ? Number(listing.buyItNowPrice) : null,
      estRetailValue: listing.estRetailValue ? Number(listing.estRetailValue) : null,
      repairCost: listing.repairCost ? Number(listing.repairCost) : null,

      // Copart Specific: Auction Details
      yardName: listing.yardName || null,
      yardNumber: listing.yardNumber || null,
      itemNumber: listing.itemNumber || null,
      sellerName: listing.sellerName || null,

      // Derived fields (prefer DB-persisted values, fall back to computing here)
      sellerCategory:
        listing.sellerCategory ||
        deriveSellerCategory(listing.rentals, listing.sellerName),
      engineSizeL:
        listing.engineSizeL != null
          ? Number(listing.engineSizeL)
          : parseEngineSizeL(listing.engine),
      geoPoint: (() => {
        if (listing.locationLat != null && listing.locationLng != null) {
          return { lat: Number(listing.locationLat), lon: Number(listing.locationLng) };
        }
        const g = geocodeZip(listing.locationZip);
        return g ? { lat: g.lat, lon: g.lon } : null;
      })(),

      // Discard state — incremental: written each time a lot is discarded/un-discarded
      discarded: listing.discarded ?? false,
      discardReason: listing.discardReason ?? null,
      discardedAt: listing.discardedAt?.toISOString() ?? null,

      // MarketCheck Specific (null for Copart)
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

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    copartInDb: number;
    totalInIndex: number;
  }> {
    const [copartCount, indexCount] = await Promise.all([
      this.prisma.auctionListing.count(),
      this.openSearchService.count(AUCTION_INDEX_NAME),
    ]);

    return {
      copartInDb: copartCount,
      totalInIndex: indexCount,
    };
  }
}
