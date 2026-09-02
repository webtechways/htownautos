import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { SELLER_CATEGORIES, deriveSellerCategory } from '@htownautos/common';
import { deriveSellerRisk, explainSellerRisk, SELLER_RISKS } from '@htownautos/common';

export interface SellerAggregateRow {
  sellerKey: string;
  sellerName: string;
  count: number;
  category: string;
  riskLevel: string;
  /** Por que salio ese nivel cuando lo puso el clasificador, no una persona. */
  riskReason?: string;
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
  private readonly logger = new Logger(SellerClassificationService.name);
  private trustedCache: string[] | null = null;
  private riskCache: Map<string, string> | null = null;
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

  /**
   * `sellerName → riskLevel` de los vendedores clasificados. Solo se guardan los
   * que NO son `high`: high es el valor por defecto de todo lo desconocido, asi
   * que listarlos seria listar medio Copart.
   */
  async getRiskByName(): Promise<Map<string, string>> {
    if (this.riskCache) return this.riskCache;
    const rows = await this.prisma.auctionSellerClassification.findMany({
      where: { riskLevel: { not: 'high' } },
      select: { sellerName: true, riskLevel: true },
    });
    this.riskCache = new Map(rows.map((r) => [r.sellerName, r.riskLevel]));
    return this.riskCache;
  }

  /** Nombres de vendedor cuyo riesgo esta en la lista pedida. */
  async getSellerNamesByRisk(levels: string[]): Promise<string[]> {
    const wanted = levels.filter((l) => (SELLER_RISKS as string[]).includes(l));
    if (!wanted.length) return [];
    const rows = await this.prisma.auctionSellerClassification.findMany({
      where: { riskLevel: { in: wanted } },
      select: { sellerName: true },
    });
    return rows.map((r) => r.sellerName);
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
    opts: { search?: string; onlyUnreviewed?: boolean; risk?: string[] } = {},
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
        const category = cls?.category ?? deriveSellerCategory(null, sellerName);
        // Sin clasificar no se inventa nada guardado: se calcula al vuelo y se
        // dice por que, para que la tabla explique el nivel en vez de imponerlo.
        const auto = explainSellerRisk(sellerName, category);
        return {
          sellerKey,
          sellerName,
          count: g._count._all,
          category,
          riskLevel: cls?.riskLevel ?? auto.risk,
          riskReason: cls?.reviewed ? undefined : auto.reason,
          trusted: cls?.trusted ?? false,
          reviewed: cls?.reviewed ?? false,
        };
      });

    if (opts.onlyUnreviewed) rows = rows.filter((r) => !r.reviewed);
    if (opts.risk?.length) rows = rows.filter((r) => opts.risk!.includes(r.riskLevel));
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
    riskLevel: string,
    assignedById: string | null,
  ): Promise<SellerAggregateRow> {
    const sellerKey = normalizeSellerKey(sellerName);
    const name = sellerName.trim();
    const cat = (SELLER_CATEGORIES as string[]).includes(category)
      ? category
      : 'Other';
    const risk = (SELLER_RISKS as string[]).includes(riskLevel) ? riskLevel : 'high';
    // `trusted` se conserva derivado para no romper el matching de compradores
    // mientras migra al filtro por riesgo. Nadie lo edita ya a mano.
    const trusted = risk === 'low';
    const row = await this.prisma.auctionSellerClassification.upsert({
      where: { sellerKey },
      create: {
        sellerKey,
        sellerName: name,
        category: cat,
        riskLevel: risk,
        trusted,
        reviewed: true,
        assignedById,
      },
      update: {
        sellerName: name,
        category: cat,
        riskLevel: risk,
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
      riskLevel: row.riskLevel,
      trusted: row.trusted,
      reviewed: row.reviewed,
    };
  }

  /**
   * Preclasifica por nombre todos los vendedores que nadie ha revisado.
   *
   * Se marcan `reviewed: false` a proposito: es una propuesta del clasificador,
   * no una decision del equipo. Asi la pantalla puede seguir enseñando cuantos
   * quedan por confirmar y el trabajo manual no se da por hecho.
   */
  async preclassifyAll(): Promise<{ scanned: number; written: number; byRisk: Record<string, number> }> {
    const rows = await this.aggregate();
    const byRisk: Record<string, number> = { low: 0, medium: 0, high: 0 };
    let written = 0;

    for (const r of rows) {
      if (r.reviewed) continue; // lo que ya decidio una persona no se toca
      const risk = deriveSellerRisk(r.sellerName, r.category);
      byRisk[risk] = (byRisk[risk] ?? 0) + 1;
      await this.prisma.auctionSellerClassification.upsert({
        where: { sellerKey: r.sellerKey },
        create: {
          sellerKey: r.sellerKey,
          sellerName: r.sellerName,
          category: r.category,
          riskLevel: risk,
          trusted: risk === 'low',
          reviewed: false,
        },
        update: { category: r.category, riskLevel: risk, trusted: risk === 'low' },
      });
      written++;
    }

    this.invalidate();
    this.logger.log(
      `[Sellers] Preclasificados ${written}/${rows.length} — bajo ${byRisk.low}, medio ${byRisk.medium}, alto ${byRisk.high}`,
    );
    return { scanned: rows.length, written, byRisk };
  }

  async remove(sellerKey: string): Promise<void> {
    await this.prisma.auctionSellerClassification
      .delete({ where: { sellerKey: normalizeSellerKey(sellerKey) } })
      .catch(() => undefined);
    this.invalidate();
  }

  private invalidate() {
    this.trustedCache = null;
    this.riskCache = null;
    this.overridesCache = null;
  }
}
