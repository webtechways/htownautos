import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OpenSearchService } from './opensearch.service';

export const AUCTION_INDEX_NAME = 'auction_listings';

@Injectable()
export class AuctionIndexService implements OnModuleInit {
  private readonly logger = new Logger(AuctionIndexService.name);

  constructor(private readonly openSearchService: OpenSearchService) {}

  async onModuleInit() {
    await this.ensureIndex();
    await this.ensureDerivedMappings();
  }

  /**
   * The production index was originally created by dynamic mapping and predates
   * the derived fields. Adding new field mappings to a live index is safe (no
   * reindex needed) as long as the field wasn't already dynamically mapped with
   * a conflicting type. `geoPoint` in particular MUST be an explicit geo_point
   * for geo_distance queries to work. Best-effort + idempotent.
   */
  async ensureDerivedMappings(): Promise<void> {
    try {
      const client = this.openSearchService.getClient();
      await client.indices.putMapping({
        index: AUCTION_INDEX_NAME,
        body: {
          properties: {
            geoPoint: { type: 'geo_point' },
            engineSizeL: { type: 'float' },
            sellerCategory: {
              type: 'keyword',
              normalizer: 'lowercase_normalizer',
            },
          },
        },
      });
      this.logger.log('Derived-field mappings ensured on auction index');
    } catch (error: any) {
      // A conflicting dynamic mapping (e.g. geoPoint already indexed as object)
      // will throw — surface it so the operator knows a reindex is required.
      this.logger.warn(
        `Could not ensure derived mappings (a reindex may be required): ${error?.message}`,
      );
    }
  }

  async ensureIndex(): Promise<boolean> {
    const exists = await this.openSearchService.indexExists(AUCTION_INDEX_NAME);
    if (exists) {
      this.logger.log(`Index ${AUCTION_INDEX_NAME} already exists`);
      return true;
    }

    return this.createIndex();
  }

  async createIndex(): Promise<boolean> {
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
          // === IDENTIFIERS ===
          id: { type: 'keyword' },
          source: { type: 'keyword' },
          sourceId: { type: 'keyword' },

          // === VEHICLE INFO ===
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

          // === MECHANICAL ===
          engine: { type: 'keyword' },
          transmission: { type: 'keyword', normalizer: 'lowercase_normalizer' },
          fuelType: { type: 'keyword', normalizer: 'lowercase_normalizer' },
          drivetrain: { type: 'keyword', normalizer: 'lowercase_normalizer' },
          cylinders: { type: 'keyword' },
          odometer: { type: 'float' },
          odometerBrand: { type: 'keyword' },

          // === LOCATION ===
          locationCity: { type: 'keyword' },
          locationState: { type: 'keyword' },
          locationZip: { type: 'keyword' },
          locationCountry: { type: 'keyword' },

          // === IMAGES ===
          images: { type: 'keyword' },
          mainImage: { type: 'keyword' },

          // === TIMESTAMPS ===
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
          indexedAt: { type: 'date' },

          // === COPART SPECIFIC: DAMAGE ===
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

          // === COPART SPECIFIC: SALE INFO ===
          saleDate: { type: 'integer' },
          saleDateFormatted: { type: 'keyword' },
          dayOfWeek: { type: 'keyword' },
          saleTime: { type: 'keyword' },
          saleStatus: { type: 'keyword', normalizer: 'lowercase_normalizer' },

          // === COPART SPECIFIC: TITLE & CONDITION ===
          saleTitleState: { type: 'keyword' },
          saleTitleType: { type: 'keyword', normalizer: 'lowercase_normalizer' },
          hasKeys: { type: 'keyword', normalizer: 'lowercase_normalizer' },
          runsDrives: { type: 'keyword', normalizer: 'lowercase_normalizer' },
          lotCondCode: { type: 'keyword' },

          // === COPART SPECIFIC: WHOLESALE ===
          wholesale: { type: 'keyword', normalizer: 'lowercase_normalizer' },
          saleLight: { type: 'keyword', normalizer: 'lowercase_normalizer' },

          // === COPART SPECIFIC: PRICING ===
          highBid: { type: 'float' },
          buyItNowPrice: { type: 'float' },
          estRetailValue: { type: 'float' },
          repairCost: { type: 'float' },

          // === COPART SPECIFIC: AUCTION DETAILS ===
          yardName: { type: 'keyword' },
          yardNumber: { type: 'integer' },
          itemNumber: { type: 'integer' },
          sellerName: { type: 'keyword' },

          // === DERIVED (at index time) ===
          sellerCategory: { type: 'keyword', normalizer: 'lowercase_normalizer' },
          engineSizeL: { type: 'float' },
          geoPoint: { type: 'geo_point' },

          // === MARKETCHECK SPECIFIC: CARFAX ===
          carfax1Owner: { type: 'boolean' },
          carfaxCleanTitle: { type: 'boolean' },

          // === MARKETCHECK SPECIFIC: DAYS ON MARKET ===
          dom: { type: 'integer' },
          domActive: { type: 'integer' },

          // === MARKETCHECK SPECIFIC: DEALER INFO ===
          dealerName: { type: 'keyword' },
          dealerCity: { type: 'keyword' },
          dealerState: { type: 'keyword' },
          dealerPhone: { type: 'keyword' },

          // === MARKETCHECK SPECIFIC: LISTING INFO ===
          heading: { type: 'text' },
          vdpUrl: { type: 'keyword' },
          sellerType: { type: 'keyword' },
          inventoryType: { type: 'keyword' },
        },
      },
    };

    return this.openSearchService.createIndex(AUCTION_INDEX_NAME, mapping);
  }

  async deleteIndex(): Promise<boolean> {
    return this.openSearchService.deleteIndex(AUCTION_INDEX_NAME);
  }

  async recreateIndex(): Promise<boolean> {
    this.logger.log('Recreating auction index...');
    await this.deleteIndex();
    return this.createIndex();
  }

  async getIndexStats(): Promise<any> {
    try {
      const client = this.openSearchService.getClient();
      const stats = await client.indices.stats({ index: AUCTION_INDEX_NAME });
      const primaries = stats.body._all?.primaries;
      const docCount = primaries?.docs?.count ?? 0;
      const sizeBytes = primaries?.store?.size_in_bytes ?? 0;
      return {
        documentCount: docCount,
        sizeInBytes: sizeBytes,
        sizeHuman: this.formatBytes(sizeBytes),
      };
    } catch (error) {
      this.logger.error(`Error getting index stats: ${error.message}`);
      return null;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
