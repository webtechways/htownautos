import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';

/**
 * BuyerFavoritesService — buyer-scoped favorite auction lots, shared between the
 * public portal (customer adds/removes from htownautos-web) and the CRM dashboard
 * (staff views each customer's favorites). Mirrors the loose lotNumber pattern of
 * FavoritesService (no hard FK to AuctionListing — favorites survive listing churn,
 * listing detail is joined on read).
 */
@Injectable()
export class BuyerFavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Serialize a raw listing row (+ yard include) for JSON: BigInt → string, flat `inspectable`. */
  private serializeListing(
    listing: ({ yard?: { physicalInspectionAvailable: boolean } | null } & Record<string, unknown>) & {
      lotNumber: bigint;
    },
  ) {
    const { yard, ...rest } = listing;
    return {
      ...rest,
      lotNumber: listing.lotNumber.toString(),
      inspectable: yard?.physicalInspectionAvailable ?? false,
    };
  }

  /**
   * Add a favorite (idempotent) by lot number OR VIN. Validates the listing
   * exists. When only a VIN is given, resolves to the most recent listing for
   * that VIN (a vehicle can be listed multiple times with different lots).
   */
  async add(
    buyerId: string,
    tenantId: string | null,
    opts: { lotNumber?: string; vin?: string },
  ) {
    let lotNumber: bigint;

    if (opts.lotNumber && opts.lotNumber.trim()) {
      try {
        lotNumber = BigInt(opts.lotNumber.trim());
      } catch {
        throw new BadRequestException(
          `Invalid lot number "${opts.lotNumber}"`,
        );
      }
      const listing = await this.prisma.auctionListing.findUnique({
        where: { lotNumber },
        select: { lotNumber: true },
      });
      if (!listing) {
        throw new NotFoundException(
          `Auction listing with lot ${opts.lotNumber} not found`,
        );
      }
    } else if (opts.vin && opts.vin.trim()) {
      const vin = opts.vin.trim().toUpperCase();
      const listing = await this.prisma.auctionListing.findFirst({
        where: { vin },
        orderBy: { saleDate: 'desc' },
        select: { lotNumber: true },
      });
      if (!listing) {
        throw new NotFoundException(
          `No auction listing found for VIN ${vin}`,
        );
      }
      lotNumber = listing.lotNumber;
    } else {
      throw new BadRequestException('Provide a lotNumber or a vin');
    }

    const favorite = await this.prisma.buyerFavorite.upsert({
      where: { buyerId_lotNumber: { buyerId, lotNumber } },
      update: {},
      create: { buyerId, tenantId, lotNumber },
    });

    return { id: favorite.id, lotNumber: lotNumber.toString(), added: true };
  }

  /** Remove a favorite (idempotent). */
  async remove(buyerId: string, lotNumberStr: string) {
    const lotNumber = BigInt(lotNumberStr);
    await this.prisma.buyerFavorite.deleteMany({
      where: { buyerId, lotNumber },
    });
    return { lotNumber: lotNumberStr, removed: true };
  }

  /** Favorite lot numbers (as strings) for the buyer — used to paint heart state. */
  async getIds(buyerId: string): Promise<string[]> {
    const rows = await this.prisma.buyerFavorite.findMany({
      where: { buyerId },
      select: { lotNumber: true },
    });
    return rows.map((r) => r.lotNumber.toString());
  }

  /**
   * Favorites for a buyer with full listing detail, newest first.
   * When `tenantId` is provided (dashboard) results are additionally scoped to it.
   */
  async list(buyerId: string, tenantId?: string | null) {
    const favorites = await this.prisma.buyerFavorite.findMany({
      where: {
        buyerId,
        ...(tenantId ? { tenantId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (favorites.length === 0) return [];

    const lotNumbers = favorites.map((f) => f.lotNumber);
    const listings = await this.prisma.auctionListing.findMany({
      where: { lotNumber: { in: lotNumbers } },
      include: { yard: { select: { physicalInspectionAvailable: true } } },
    });

    const byLot = new Map(
      listings.map((l) => [l.lotNumber.toString(), this.serializeListing(l)]),
    );

    return favorites.map((f) => ({
      id: f.id,
      lotNumber: f.lotNumber.toString(),
      createdAt: f.createdAt,
      listing: byLot.get(f.lotNumber.toString()) ?? null,
    }));
  }
}
