import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { canonicalize } from '@htownautos/common';
import { AuctionAliasService } from '../auction-alias/auction-alias.service';

/**
 * Aggregated facets from the auction_listings table.
 *
 * Options come from the CANONICAL columns (makeCanonical / modelCanonical / …)
 * so each value appears exactly once — no case/whitespace/spelling duplicates.
 * Incoming make/model params are canonicalized too, so an option chosen here
 * always matches the same canonical column the buyer-matching filters on. Stale
 * lots are excluded so the form only offers options still in inventory.
 */
@Injectable()
export class AuctionFacetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aliases: AuctionAliasService,
  ) {}

  async makes(params: {
    yearFrom?: number;
    yearTo?: number;
  }): Promise<string[]> {
    const { yearFrom, yearTo } = params;
    const rows = await this.prisma.auctionListing.findMany({
      select: { makeCanonical: true },
      distinct: ['makeCanonical'],
      where: {
        makeCanonical: { not: null },
        isStale: false,
        ...yearRangeClause(yearFrom, yearTo),
      },
      orderBy: { makeCanonical: 'asc' },
      take: 1000,
    });
    return rows.map((r) => r.makeCanonical!).filter(Boolean);
  }

  async models(params: {
    make: string;
    yearFrom?: number;
    yearTo?: number;
  }): Promise<string[]> {
    const { make, yearFrom, yearTo } = params;
    if (!make) return [];
    const makeC = canonicalize(make, await this.aliases.getCanonicalMap('make'));
    const rows = await this.prisma.auctionListing.findMany({
      select: { modelCanonical: true },
      distinct: ['modelCanonical'],
      where: {
        makeCanonical: makeC,
        modelCanonical: { not: null },
        isStale: false,
        ...yearRangeClause(yearFrom, yearTo),
      },
      orderBy: { modelCanonical: 'asc' },
      take: 1000,
    });
    return rows.map((r) => r.modelCanonical!).filter(Boolean);
  }

  async trims(params: {
    make: string;
    models: string[];
    yearFrom?: number;
    yearTo?: number;
  }): Promise<string[]> {
    const { make, models, yearFrom, yearTo } = params;
    if (!make || models.length === 0) return [];
    const makeC = canonicalize(make, await this.aliases.getCanonicalMap('make'));
    const modelMap = await this.aliases.getCanonicalMap('model');
    const modelsC = models
      .map((m) => canonicalize(m, modelMap))
      .filter((v): v is string => !!v);
    const rows = await this.prisma.auctionListing.findMany({
      select: { trimCanonical: true },
      distinct: ['trimCanonical'],
      where: {
        makeCanonical: makeC,
        modelCanonical: { in: modelsC },
        trimCanonical: { not: null },
        isStale: false,
        ...yearRangeClause(yearFrom, yearTo),
      },
      orderBy: { trimCanonical: 'asc' },
      take: 2000,
    });
    return rows.map((r) => r.trimCanonical!).filter(Boolean);
  }

  async colors(): Promise<string[]> {
    const rows = await this.prisma.auctionListing.findMany({
      select: { colorCanonical: true },
      distinct: ['colorCanonical'],
      where: { colorCanonical: { not: null }, isStale: false },
      orderBy: { colorCanonical: 'asc' },
      take: 500,
    });
    return rows.map((r) => r.colorCanonical!).filter(Boolean);
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
