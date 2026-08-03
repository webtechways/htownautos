import { Injectable } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import {
  CANONICAL_FIELDS,
  normalizeToken,
  type AliasMap,
  type CanonicalField,
} from '@htownautos/common';

export interface AliasAggregateRow {
  field: CanonicalField;
  aliasKey: string; // normalized value seen in the data (the key)
  value: string; // display (same as aliasKey — UPPERCASE)
  count: number;
  canonical: string;
  reviewed: boolean;
}

/** The raw + canonical AuctionListing columns that back each canonical field. */
const FIELD_COLUMN: Record<CanonicalField, 'make' | 'modelGroup' | 'trim' | 'color'> = {
  make: 'make',
  model: 'modelGroup',
  trim: 'trim',
  color: 'color',
};
const CANON_COLUMN: Record<CanonicalField, string> = {
  make: 'makeCanonical',
  model: 'modelCanonical',
  trim: 'trimCanonical',
  color: 'colorCanonical',
};

/** SQL that reproduces normalizeToken() on a raw column (must stay in sync). */
function normSql(rawCol: string): string {
  return `UPPER(regexp_replace(regexp_replace(trim("${rawCol}"), '\\s+', ' ', 'g'), '^[^A-Za-z0-9]+|[^A-Za-z0-9]+$', '', 'g'))`;
}

/**
 * Staff-curated alias → canonical maps for auction filter fields. Mirrors
 * SellerClassificationService: ingestion, facets and matching read the maps live
 * (cached) so a merge applies immediately with no reindex. Global.
 */
@Injectable()
export class AuctionAliasService {
  private caches = new Map<CanonicalField, AliasMap>();

  constructor(private readonly prisma: PrismaService) {}

  /** `normalizedVariant → canonical` map for one field (cached until a write). */
  async getCanonicalMap(field: CanonicalField): Promise<AliasMap> {
    const cached = this.caches.get(field);
    if (cached) return cached;
    const rows = await this.prisma.auctionValueAlias.findMany({
      where: { field },
      select: { aliasKey: true, canonical: true },
    });
    const map: AliasMap = {};
    for (const r of rows) map[r.aliasKey] = r.canonical;
    this.caches.set(field, map);
    return map;
  }

  /** All four field maps (for ingestion / backfill). */
  async getAllMaps(): Promise<Record<CanonicalField, AliasMap>> {
    const out = {} as Record<CanonicalField, AliasMap>;
    for (const f of CANONICAL_FIELDS) out[f] = await this.getCanonicalMap(f);
    return out;
  }

  /** Distinct raw values + lot counts for a field, folded by normalizeToken. */
  private async normalizedCounts(
    field: CanonicalField,
  ): Promise<Map<string, number>> {
    const col = FIELD_COLUMN[field];
    const rows = await this.prisma.auctionListing.groupBy({
      by: [col],
      where: { isStale: false, [col]: { not: null } },
      _count: { _all: true },
    } as never);
    const merged = new Map<string, number>();
    for (const r of rows as Array<Record<string, unknown> & { _count: { _all: number } }>) {
      const norm = normalizeToken(r[col] as string | null);
      if (!norm) continue;
      merged.set(norm, (merged.get(norm) ?? 0) + r._count._all);
    }
    return merged;
  }

  /**
   * Every distinct (normalized) value for a field joined with its alias override —
   * the source for the Settings → Vehicle Data table. Canonical falls back to the
   * value itself when nobody has merged it yet.
   */
  async aggregate(
    field: CanonicalField,
    opts: { search?: string; onlyUnreviewed?: boolean } = {},
  ): Promise<AliasAggregateRow[]> {
    const counts = await this.normalizedCounts(field);
    const aliases = await this.prisma.auctionValueAlias.findMany({
      where: { field },
      select: { aliasKey: true, canonical: true, reviewed: true },
    });
    const byKey = new Map(aliases.map((a) => [a.aliasKey, a]));

    let rows: AliasAggregateRow[] = [...counts.entries()].map(([key, count]) => {
      const a = byKey.get(key);
      return {
        field,
        aliasKey: key,
        value: key,
        count,
        canonical: a?.canonical ?? key,
        reviewed: a?.reviewed ?? false,
      };
    });

    if (opts.onlyUnreviewed) rows = rows.filter((r) => !r.reviewed);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.value.toLowerCase().includes(q) ||
          r.canonical.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => b.count - a.count);
    return rows;
  }

  /** Count of distinct values (across all fields) still needing staff review. */
  async unreviewedCount(): Promise<number> {
    let total = 0;
    for (const f of CANONICAL_FIELDS) {
      const rows = await this.aggregate(f, { onlyUnreviewed: true });
      total += rows.length;
    }
    return total;
  }

  /** Merge a variant into a canonical value. Marks reviewed, clears the cache. */
  async setAlias(
    field: string,
    aliasKey: string,
    canonical: string,
    assignedById: string | null,
  ): Promise<AliasAggregateRow> {
    const f = field as CanonicalField;
    const key = normalizeToken(aliasKey);
    const canon = normalizeToken(canonical);
    if (!key || !canon) {
      throw new Error('aliasKey and canonical must be non-empty');
    }
    const row = await this.prisma.auctionValueAlias.upsert({
      where: { field_aliasKey: { field: f, aliasKey: key } },
      create: { field: f, aliasKey: key, canonical: canon, reviewed: true, assignedById },
      update: { canonical: canon, reviewed: true, assignedById },
    });
    this.caches.delete(f);
    // Re-canonicalize the affected listings now so facets + matching reflect the
    // merge immediately (the OpenSearch sidebar catches up on the next sync).
    await this.prisma.$executeRawUnsafe(
      `UPDATE "auction_listings" SET "${CANON_COLUMN[f]}" = $1 WHERE ${normSql(FIELD_COLUMN[f])} = $2`,
      canon,
      key,
    );
    return {
      field: f,
      aliasKey: row.aliasKey,
      value: row.aliasKey,
      count: 0,
      canonical: row.canonical,
      reviewed: row.reviewed,
    };
  }

  async remove(field: string, aliasKey: string): Promise<void> {
    const f = field as CanonicalField;
    const key = normalizeToken(aliasKey);
    if (!key) return;
    await this.prisma.auctionValueAlias
      .delete({ where: { field_aliasKey: { field: f, aliasKey: key } } })
      .catch(() => undefined);
    this.caches.delete(f);
    // Revert affected listings to their deterministic canonical (= the aliasKey).
    await this.prisma.$executeRawUnsafe(
      `UPDATE "auction_listings" SET "${CANON_COLUMN[f]}" = $1 WHERE ${normSql(FIELD_COLUMN[f])} = $1`,
      key,
    );
  }
}
