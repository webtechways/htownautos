import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';

/**
 * Aggregated facets from the auction_listings table.
 *
 * Everything comes straight from the Copart feed (live data). Stale lots
 * are excluded by default so the form only offers options that still
 * exist in the current inventory — guarantees that filtering by a buyer's
 * saved preferences will always have matching candidates.
 */
@Injectable()
export class AuctionFacetsService {
  constructor(private readonly prisma: PrismaService) {}

  async makes(params: {
    yearFrom?: number;
    yearTo?: number;
  }): Promise<string[]> {
    const { yearFrom, yearTo } = params;
    const rows = await this.prisma.auctionListing.findMany({
      select: { make: true },
      distinct: ['make'],
      where: {
        make: { not: null },
        isStale: false,
        ...yearRangeClause(yearFrom, yearTo),
      },
      orderBy: { make: 'asc' },
      take: 1000,
    });
    return rows.map((r) => r.make!).filter(Boolean);
  }

  async models(params: {
    make: string;
    yearFrom?: number;
    yearTo?: number;
  }): Promise<string[]> {
    const { make, yearFrom, yearTo } = params;
    if (!make) return [];
    const rows = await this.prisma.auctionListing.findMany({
      select: { modelGroup: true },
      distinct: ['modelGroup'],
      where: {
        make: { equals: make, mode: 'insensitive' },
        modelGroup: { not: null },
        isStale: false,
        ...yearRangeClause(yearFrom, yearTo),
      },
      orderBy: { modelGroup: 'asc' },
      take: 1000,
    });
    return rows.map((r) => r.modelGroup!).filter(Boolean);
  }

  async trims(params: {
    make: string;
    models: string[];
    yearFrom?: number;
    yearTo?: number;
  }): Promise<string[]> {
    const { make, models, yearFrom, yearTo } = params;
    if (!make || models.length === 0) return [];
    const rows = await this.prisma.auctionListing.findMany({
      select: { trim: true },
      distinct: ['trim'],
      where: {
        make: { equals: make, mode: 'insensitive' },
        modelGroup: { in: models, mode: 'insensitive' },
        trim: { not: null },
        isStale: false,
        ...yearRangeClause(yearFrom, yearTo),
      },
      orderBy: { trim: 'asc' },
      take: 2000,
    });
    return rows.map((r) => r.trim!).filter(Boolean);
  }

  async colors(): Promise<string[]> {
    const rows = await this.prisma.auctionListing.findMany({
      select: { color: true },
      distinct: ['color'],
      where: { color: { not: null }, isStale: false },
      orderBy: { color: 'asc' },
      take: 500,
    });
    return rows.map((r) => r.color!).filter(Boolean);
  }

  async titleTypes(): Promise<string[]> {
    const rows = await this.prisma.auctionListing.findMany({
      select: { saleTitleType: true },
      distinct: ['saleTitleType'],
      where: { saleTitleType: { not: null }, isStale: false },
      orderBy: { saleTitleType: 'asc' },
      take: 200,
    });
    return rows.map((r) => r.saleTitleType!).filter(Boolean);
  }

  /**
   * Min / max year present in the feed so the form can cap year inputs
   * at something sensible.
   */
  async yearBounds(): Promise<{ min: number | null; max: number | null }> {
    const agg = await this.prisma.auctionListing.aggregate({
      _min: { year: true },
      _max: { year: true },
      where: { year: { not: null }, isStale: false },
    });
    return { min: agg._min.year ?? null, max: agg._max.year ?? null };
  }
}

function yearRangeClause(
  yearFrom?: number,
  yearTo?: number,
): Prisma.AuctionListingWhereInput {
  if (!yearFrom && !yearTo) return {};
  const year: Prisma.IntNullableFilter = {};
  if (yearFrom) year.gte = yearFrom;
  if (yearTo) year.lte = yearTo;
  return { year };
}
