import { Prisma } from '@prisma/client';

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
 * Semantics (kept identical to the original on-demand matcher):
 *   - `make` is required and matched case-insensitively.
 *   - year range is inclusive; either bound is optional.
 *   - models / trims / titleTypes / colors are case-insensitive membership
 *     filters; an empty array means "any".
 *   - maxMileage / maxCost are NULL-tolerant: a listing with an unknown
 *     odometer/highBid is NOT excluded, because "unknown" must not preempt a
 *     potential match. maxCost is a hard cap — a bid already above budget
 *     excludes the listing.
 *   - only non-stale listings are considered.
 */
export function preferenceToWhere(
  pref: WantedPreferenceCriteria,
): Prisma.AuctionListingWhereInput {
  const where: Prisma.AuctionListingWhereInput = {
    isStale: false,
    make: { equals: pref.make, mode: 'insensitive' },
  };

  if (pref.yearFrom || pref.yearTo) {
    const year: Prisma.IntNullableFilter = {};
    if (pref.yearFrom) year.gte = pref.yearFrom;
    if (pref.yearTo) year.lte = pref.yearTo;
    where.year = year;
  }
  if (pref.models.length > 0) {
    where.modelGroup = { in: pref.models, mode: 'insensitive' };
  }
  if (pref.trims.length > 0) {
    where.trim = { in: pref.trims, mode: 'insensitive' };
  }
  if (pref.titleTypes.length > 0) {
    where.saleTitleType = { in: pref.titleTypes, mode: 'insensitive' };
  }
  if (pref.colors.length > 0) {
    where.color = { in: pref.colors, mode: 'insensitive' };
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
