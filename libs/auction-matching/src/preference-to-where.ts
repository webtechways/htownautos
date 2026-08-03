import { Prisma } from '@prisma/client';
import { canonicalize, type AliasMap, type CanonicalField } from '@htownautos/common';

/** Optional per-field alias maps so preference values match the canonical columns. */
export type CanonicalMaps = Partial<Record<CanonicalField, AliasMap>>;

/**
 * Minimal shape of a buyer's wanted-vehicle preference needed to build an
 * auction-listing match query. Mirrors the relevant columns of
 * `BuyerVehiclePreference` so both the API (on-demand matching) and the
 * data-sync worker (proactive new-listing matching) can share one source of
 * truth for the matching semantics.
 */
export interface WantedPreferenceCriteria {
  yearFrom: number | null;
  yearTo: number | null;
  make: string;
  models: string[];
  trims: string[];
  maxMileage: number | null;
  titleTypes: string[];
  colors: string[];
  maxCost: Prisma.Decimal | null;
}

/**
 * Converts one buyer preference into a Prisma `where` subclause against
 * `AuctionListing`.
 *
 * Semantics:
 *   - make / models / trims / colors match on the canonical columns
 *     (makeCanonical / modelCanonical / trimCanonical / colorCanonical), after
 *     canonicalizing the preference value (normalize + alias). This dedupes case /
 *     whitespace / spelling variants, so a buyer no longer needs to pick every
 *     variant. `titleTypes` keeps its own case-insensitive match.
 *   - year range is inclusive; either bound is optional.
 *   - maxMileage / maxCost are NULL-tolerant: a listing with an unknown
 *     odometer/highBid is NOT excluded, because "unknown" must not preempt a
 *     potential match. maxCost is a hard cap — a bid already above budget
 *     excludes the listing.
 *   - only non-stale listings are considered.
 */
export function preferenceToWhere(
  pref: WantedPreferenceCriteria,
  maps: CanonicalMaps = {},
): Prisma.AuctionListingWhereInput {
  const canonList = (values: string[], map?: AliasMap): string[] =>
    values
      .map((v) => canonicalize(v, map))
      .filter((v): v is string => !!v);

  const where: Prisma.AuctionListingWhereInput = {
    isStale: false,
    makeCanonical: { equals: canonicalize(pref.make, maps.make) },
  };

  if (pref.yearFrom || pref.yearTo) {
    const year: Prisma.IntNullableFilter = {};
    if (pref.yearFrom) year.gte = pref.yearFrom;
    if (pref.yearTo) year.lte = pref.yearTo;
    where.year = year;
  }
  if (pref.models.length > 0) {
    where.modelCanonical = { in: canonList(pref.models, maps.model) };
  }
  if (pref.trims.length > 0) {
    where.trimCanonical = { in: canonList(pref.trims, maps.trim) };
  }
  if (pref.titleTypes.length > 0) {
    where.saleTitleType = { in: pref.titleTypes, mode: 'insensitive' };
  }
  if (pref.colors.length > 0) {
    where.colorCanonical = { in: canonList(pref.colors, maps.color) };
  }

  const andClauses: Prisma.AuctionListingWhereInput[] = [];

  if (pref.maxMileage != null) {
    andClauses.push({
      OR: [{ odometer: { lte: pref.maxMileage } }, { odometer: null }],
    });
  }
  if (pref.maxCost != null) {
    andClauses.push({
      OR: [{ highBid: { lte: pref.maxCost } }, { highBid: null }],
    });
  }
  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  return where;
}

/** Today's date as a YYYYMMDD integer in UTC (matches `AuctionListing.saleDate`). */
export function todayAsDateInt(now: Date = new Date()): number {
  return (
    now.getUTCFullYear() * 10000 +
    (now.getUTCMonth() + 1) * 100 +
    now.getUTCDate()
  );
}

/**
 * A Prisma `where` subclause that keeps only listings whose sale is not clearly
 * in the past. Lots with no saleDate always pass (render as "Future Sale").
 * Uses a 1-day margin to tolerate time-zone wraparound.
 */
export function futureSaleWhere(
  todayInt: number = todayAsDateInt(),
): Prisma.AuctionListingWhereInput {
  return {
    OR: [{ saleDate: null }, { saleDate: { gte: todayInt - 1 } }],
  };
}
