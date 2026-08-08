import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { SaleResultItemDto } from './dto/ingest-sale-results.dto';

export interface IngestSummary {
  received: number;
  upserted: number;
  matched: number;
  unmatched: number;
  bidUpdated: number;
  unmatchedLots: string[];
}

@Injectable()
export class AuctionSaleResultsService {
  private readonly logger = new Logger(AuctionSaleResultsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ingest a batch of scraped sale outcomes. For each item we resolve the sale
   * date, pull the full vehicle from auction_listings by lot number, MERGE both
   * into a single row, and upsert on (lot, saleDate) so re-sends are idempotent
   * while re-auctions on a different day create a new row.
   */
  async ingest(items: SaleResultItemDto[]): Promise<IngestSummary> {
    const summary: IngestSummary = {
      received: items.length,
      upserted: 0,
      matched: 0,
      unmatched: 0,
      bidUpdated: 0,
      unmatchedLots: [],
    };

    for (const item of items) {
      try {
        const lot = BigInt(Math.trunc(item.lot));
        const saleDate = this.resolveSaleDate(item);
        const { slug: saleLocationSlug } = this.parsePageUrl(item.pageUrl);

        const listing = await this.prisma.auctionListing.findUnique({
          where: { lotNumber: lot },
        });
        if (listing) summary.matched++;
        else {
          summary.unmatched++;
          summary.unmatchedLots.push(lot.toString());
        }

        const incoming = {
          saleDate,
          auctionSession: item.auction ?? null,
          saleLocationSlug,
          finalBid: item.bid ?? null,
          askingPrice: item.asking ?? null,
          reserve: item.reserve ?? null,
          sold: item.sold ?? null,
          ticks: item.ticks ?? null,
          round: item.round ?? null,
          saleOrder: item.order ?? null,
          event: item.event ?? null,
          pageUrl: item.pageUrl ?? null,
          receivedAt: item.receivedAt ? new Date(item.receivedAt) : null,
          raw: item as unknown as Prisma.InputJsonValue,
        };

        const vehicle = listing
          ? {
              matched: true,
              vin: listing.vin ?? null,
              year: listing.year ?? null,
              make: listing.make ?? null,
              model: listing.modelGroup ?? null,
              modelDetail: listing.modelDetail ?? null,
              trim: listing.trim ?? null,
              bodyStyle: listing.bodyStyle ?? null,
              color: listing.color ?? null,
              damageDescription: listing.damageDescription ?? null,
              secondaryDamage: listing.secondaryDamage ?? null,
              saleTitleType: listing.saleTitleType ?? null,
              saleTitleState: listing.saleTitleState ?? null,
              odometer: listing.odometer ?? null,
              runsDrives: listing.runsDrives ?? null,
              engine: listing.engine ?? null,
              transmission: listing.transmission ?? null,
              drive: listing.drive ?? null,
              fuelType: listing.fuelType ?? null,
              cylinders: listing.cylinders ?? null,
              estRetailValue: listing.estRetailValue ?? null,
              repairCost: listing.repairCost ?? null,
              highBidAtSync: listing.highBid ?? null,
              yardNumber: listing.yardNumber ?? null,
              yardName: listing.yardName ?? null,
              locationCity: listing.locationCity ?? null,
              locationState: listing.locationState ?? null,
              locationZip: listing.locationZip ?? null,
              sellerName: listing.sellerName ?? null,
              sellerCategory: listing.sellerCategory ?? null,
              vehicleSnapshot: this.serializeListing(listing),
            }
          : { matched: false };

        const data = { ...incoming, ...vehicle };

        await this.prisma.auctionSaleResult.upsert({
          where: { lot_saleDate: { lot, saleDate } },
          create: { lot, ...data },
          update: data,
        });
        summary.upserted++;

        // Reflect the scraped final bid onto the listing itself (overwrite
        // highBid) and flag it as auctioned (bidded) — only when the lot matched
        // and a bid was reported. `bidded` powers the Auction Listing filter.
        if (listing && item.bid != null) {
          await this.prisma.auctionListing.update({
            where: { lotNumber: lot },
            data: { highBid: item.bid, bidded: true },
          });
          summary.bidUpdated++;
        }
      } catch (err: any) {
        this.logger.error(
          `Failed to ingest lot ${item?.lot}: ${err?.message ?? err}`,
        );
      }
    }

    this.logger.log(
      `Ingest done: received=${summary.received} upserted=${summary.upserted} matched=${summary.matched} unmatched=${summary.unmatched} bidUpdated=${summary.bidUpdated}`,
    );
    return summary;
  }

  /** YYYYMMDD from the pageUrl `sale-date-…`, else the UTC date of receivedAt,
   * else today (UTC). Never null so the (lot, saleDate) upsert key is stable. */
  private resolveSaleDate(item: SaleResultItemDto): number {
    const fromUrl = this.parsePageUrl(item.pageUrl).saleDate;
    if (fromUrl != null) return fromUrl;
    const d = item.receivedAt ? new Date(item.receivedAt) : new Date();
    const valid = isNaN(d.getTime()) ? new Date() : d;
    return (
      valid.getUTCFullYear() * 10000 +
      (valid.getUTCMonth() + 1) * 100 +
      valid.getUTCDate()
    );
  }

  private parsePageUrl(pageUrl?: string | null): {
    saleDate: number | null;
    slug: string | null;
  } {
    if (!pageUrl) return { saleDate: null, slug: null };
    const date = /sale-date-(\d{8})/.exec(pageUrl);
    const loc = /sale-location-id-([^/]+)/.exec(pageUrl);
    return {
      saleDate: date ? parseInt(date[1], 10) : null,
      slug: loc ? loc[1] : null,
    };
  }

  /** JSON-safe clone of a listing row (BigInt→string; Prisma.Decimal + Date
   * serialize via their own toJSON). */
  private serializeListing(listing: unknown): Prisma.InputJsonValue {
    return JSON.parse(
      JSON.stringify(listing, (_k, v) =>
        typeof v === 'bigint' ? v.toString() : v,
      ),
    );
  }
}
