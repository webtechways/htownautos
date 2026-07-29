import { Injectable } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import {
  ASSIGNABLE_TITLE_CATEGORIES,
  type TitleOverrides,
} from '@htownautos/common';

/**
 * Loads and caches the learned `saleTitleType` code → category overrides that
 * staff assign from the auction listing UI. Both the OpenSearch search service
 * (CRM) and the Postgres portal service read these so an assignment applies to
 * every lot with that code immediately — no reindex, no per-row update.
 */
@Injectable()
export class TitleMappingService {
  private cache: TitleOverrides | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /** All overrides as a `{ code: category }` map (cached until a write). */
  async getOverrides(): Promise<TitleOverrides> {
    if (this.cache) return this.cache;
    const rows = await this.prisma.auctionTitleTypeMapping.findMany({
      select: { code: true, category: true },
    });
    const map: TitleOverrides = {};
    for (const r of rows) {
      if ((ASSIGNABLE_TITLE_CATEGORIES as string[]).includes(r.category)) {
        map[r.code.toLowerCase()] = r.category as TitleOverrides[string];
      }
    }
    this.cache = map;
    return map;
  }

  async list(): Promise<Array<{ code: string; category: string }>> {
    return this.prisma.auctionTitleTypeMapping.findMany({
      select: { code: true, category: true },
      orderBy: { code: 'asc' },
    });
  }

  /** Assign (or reassign) a code to a category. Invalidates the cache. */
  async setMapping(
    code: string,
    category: string,
    assignedById: string | null,
  ): Promise<{ code: string; category: string }> {
    const c = code.toLowerCase().trim();
    const row = await this.prisma.auctionTitleTypeMapping.upsert({
      where: { code: c },
      create: { code: c, category, assignedById },
      update: { category, assignedById },
      select: { code: true, category: true },
    });
    this.cache = null;
    return row;
  }

  async removeMapping(code: string): Promise<void> {
    await this.prisma.auctionTitleTypeMapping
      .delete({ where: { code: code.toLowerCase().trim() } })
      .catch(() => undefined);
    this.cache = null;
  }
}
