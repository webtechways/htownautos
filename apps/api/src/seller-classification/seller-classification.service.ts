import { Injectable } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { SELLER_CATEGORIES, deriveSellerCategory } from '@htownautos/common';

export interface SellerAggregateRow {
  sellerKey: string;
  sellerName: string;
  count: number;
  category: string;
  trusted: boolean;
  reviewed: boolean;
}

/** Stable key for a seller name (case/space-insensitive). */
export function normalizeSellerKey(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Staff-curated seller trust + Source classification. Mirrors TitleMappingService:
 * both the matching filter (Trusted Seller) and the Source facet read these live,
 * so a change applies immediately with no reindex. Global (auction data is shared).
 */
@Injectable()
export class SellerClassificationService {
  private trustedCache: string[] | null = null;
  private overridesCache: Record<string, string> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /** Display sellerNames staff marked trusted (cached until a write). */
  async getTrustedSellerNames(): Promise<string[]> {
    if (this.trustedCache) return this.trustedCache;
    const rows = await this.prisma.auctionSellerClassification.findMany({
      where: { trusted: true },
      select: { sellerName: true },
    });
    const names = rows.map((r) => r.sellerName);
    this.trustedCache = names;
    return names;
  }

  /** `sellerKey → category` override map (cached until a write). */
  async getCategoryOverrides(): Promise<Record<string, string>> {
    if (this.overridesCache) return this.overridesCache;
    const rows = await this.prisma.auctionSellerClassification.findMany({
      select: { sellerKey: true, category: true },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.sellerKey] = r.category;
    this.overridesCache = { ...map };
    return map;
  }

  /**
   * Every distinct seller in the data joined with its classification — the
   * source for the Settings → Sellers table. Category falls back to the derived
   * heuristic for sellers nobody has classified yet.
   */
  async aggregate(
    opts: { search?: string; onlyUnreviewed?: boolean } = {},
  ): Promise<SellerAggregateRow[]> {
    const grouped = await this.prisma.auctionListing.groupBy({
      by: ['sellerName'],
      where: { sellerName: { not: null } },
      _count: { _all: true },
    });
    const classifications =
      await this.prisma.auctionSellerClassification.findMany();
    const byKey = new Map(classifications.map((c) => [c.sellerKey, c]));

    let rows: SellerAggregateRow[] = grouped
      .filter((g) => g.sellerName)
      .map((g) => {
        const sellerName = g.sellerName as string;
        const sellerKey = normalizeSellerKey(sellerName);
        const cls = byKey.get(sellerKey);
        return {
          sellerKey,
          sellerName,
          count: g._count._all,
          category: cls?.category ?? deriveSellerCategory(null, sellerName),
          trusted: cls?.trusted ?? false,
          reviewed: cls?.reviewed ?? false,
        };
      });

    if (opts.onlyUnreviewed) rows = rows.filter((r) => !r.reviewed);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      rows = rows.filter((r) => r.sellerName.toLowerCase().includes(q));
    }
    rows.sort((a, b) => b.count - a.count);
    return rows;
  }

  /** How many sellers present in the data still need staff review. */
  async unreviewedCount(): Promise<number> {
    const rows = await this.aggregate({ onlyUnreviewed: true });
    return rows.length;
  }

  /** Classify (or reclassify) a seller. Marks it reviewed and clears the cache. */
  async setClassification(
    sellerName: string,
    category: string,
    trusted: boolean,
    assignedById: string | null,
  ): Promise<SellerAggregateRow> {
    const sellerKey = normalizeSellerKey(sellerName);
    const name = sellerName.trim();
    const cat = (SELLER_CATEGORIES as string[]).includes(category)
      ? category
      : 'Other';
    const row = await this.prisma.auctionSellerClassification.upsert({
      where: { sellerKey },
      create: {
        sellerKey,
        sellerName: name,
        category: cat,
        trusted,
        reviewed: true,
        assignedById,
      },
      update: {
        sellerName: name,
        category: cat,
        trusted,
        reviewed: true,
        assignedById,
      },
    });
    this.invalidate();
    return {
      sellerKey: row.sellerKey,
      sellerName: row.sellerName,
      count: 0,
      category: row.category,
      trusted: row.trusted,
      reviewed: row.reviewed,
    };
  }

  async remove(sellerKey: string): Promise<void> {
    await this.prisma.auctionSellerClassification
      .delete({ where: { sellerKey: normalizeSellerKey(sellerKey) } })
      .catch(() => undefined);
    this.invalidate();
  }

  private invalidate() {
    this.trustedCache = null;
    this.overridesCache = null;
  }
}
