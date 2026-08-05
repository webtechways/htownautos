import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { UpdateImageScrapeConfigDto } from './dto/update-image-scrape-config.dto';

const CONFIG_ID = 'singleton';

const DEFAULT_CONFIG = {
  id: CONFIG_ID,
  paused: false,
  lotsPerTick: 6,
  maxAttempts: 5,
  perSequenceDelayMs: 0,
  concurrency: 4,
};

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

function clampPage(page?: number, limit?: number) {
  const p = Math.max(1, Math.floor(Number(page) || 1));
  const l = Math.min(100, Math.max(1, Math.floor(Number(limit) || 25)));
  return { p, l, skip: (p - 1) * l };
}

/**
 * Control plane for the image scraping/caching subsystem (global, staff-only).
 * The data-sync crawler reads {@link getConfig} every tick; this service only
 * reads/writes the queue + config + proxy inventory for the Settings UI.
 */
@Injectable()
export class ImageCacheService {
  private readonly logger = new Logger(ImageCacheService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getConfig() {
    const cfg = await this.prisma.imageScrapeConfig.findUnique({ where: { id: CONFIG_ID } });
    return cfg ?? DEFAULT_CONFIG;
  }

  async updateConfig(dto: UpdateImageScrapeConfigDto) {
    return this.prisma.imageScrapeConfig.upsert({
      where: { id: CONFIG_ID },
      update: { ...dto },
      create: { id: CONFIG_ID, ...dto },
    });
  }

  /** Live counters + config for the control panel. */
  async getStatus() {
    const [grouped, cachedCount, config] = await Promise.all([
      this.prisma.imageCacheJob.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.auctionListing.count({ where: { galleryCachedAt: { not: null } } }),
      this.getConfig(),
    ]);

    const counts = { pending: 0, processing: 0, done: 0, failed: 0 } as Record<string, number>;
    for (const g of grouped) counts[g.status] = g._count._all;

    // Tick runs every minute → ETA ≈ pending / lotsPerTick minutes.
    const perTick = config.lotsPerTick || 1;
    const etaMinutes = Math.ceil(counts.pending / perTick);

    return {
      counts,
      queueDepth: counts.pending + counts.processing,
      cachedListings: cachedCount,
      etaMinutes,
      config,
    };
  }

  async listJobs(params: { status?: string; page?: number; limit?: number }): Promise<Paginated<any>> {
    const { p, l, skip } = clampPage(params.page, params.limit);
    const where: Prisma.ImageCacheJobWhereInput = params.status
      ? { status: params.status }
      : {};

    const [rows, total] = await Promise.all([
      this.prisma.imageCacheJob.findMany({
        where,
        orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
        skip,
        take: l,
      }),
      this.prisma.imageCacheJob.count({ where }),
    ]);

    return { data: rows.map((r) => this.serializeJob(r)), total, page: p, limit: l };
  }

  /** Lots that failed after every retry, or cached with some failed sequences. */
  async listFailures(params: { page?: number; limit?: number }): Promise<Paginated<any>> {
    const { p, l, skip } = clampPage(params.page, params.limit);
    const where: Prisma.ImageCacheJobWhereInput = {
      OR: [{ status: 'failed' }, { failedSequences: { not: Prisma.DbNull } }],
    };

    const [rows, total] = await Promise.all([
      this.prisma.imageCacheJob.findMany({
        where,
        orderBy: { lastAttemptAt: 'desc' },
        skip,
        take: l,
      }),
      this.prisma.imageCacheJob.count({ where }),
    ]);

    return { data: rows.map((r) => this.serializeJob(r)), total, page: p, limit: l };
  }

  /** Re-queue a failed lot so the crawler picks it up again. */
  async retryJob(lotNumberStr: string) {
    const lotNumber = BigInt(lotNumberStr);
    await this.prisma.imageCacheJob.update({
      where: { lotNumber },
      data: {
        status: 'pending',
        lastError: null,
        failedSequences: Prisma.DbNull,
      },
    });
    return { lotNumber: lotNumberStr, status: 'pending' };
  }

  /** Recently cached lots (source of truth = AuctionListing.galleryCachedAt). */
  async listCached(params: { page?: number; limit?: number }): Promise<Paginated<any>> {
    const { p, l, skip } = clampPage(params.page, params.limit);
    const where: Prisma.AuctionListingWhereInput = { galleryCachedAt: { not: null } };

    const [rows, total] = await Promise.all([
      this.prisma.auctionListing.findMany({
        where,
        orderBy: { galleryCachedAt: 'desc' },
        skip,
        take: l,
        select: {
          lotNumber: true,
          year: true,
          make: true,
          modelGroup: true,
          galleryCache: true,
          galleryCachedAt: true,
        },
      }),
      this.prisma.auctionListing.count({ where }),
    ]);

    const data = rows.map((r) => ({
      lotNumber: r.lotNumber.toString(),
      year: r.year,
      make: r.make,
      model: r.modelGroup,
      imageCount: this.imageCount(r.galleryCache),
      cachedAt: r.galleryCachedAt,
    }));

    return { data, total, page: p, limit: l };
  }

  /** Full proxy inventory incl. retired (kept across Webshare renewals). */
  async listProxies() {
    const proxies = await this.prisma.proxy.findMany({
      orderBy: [{ isActive: 'desc' }, { retiredAt: 'asc' }, { address: 'asc' }],
      select: {
        id: true,
        address: true,
        port: true,
        country: true,
        city: true,
        status: true,
        isActive: true,
        lastCheckedAt: true,
        lastSeenInFeedAt: true,
        retiredAt: true,
      },
    });
    return { data: proxies, total: proxies.length };
  }

  // ── helpers ────────────────────────────────────────────────────────────────
  private serializeJob(r: {
    lotNumber: bigint;
    status: string;
    priority: number | null;
    attempts: number;
    failedSequences: Prisma.JsonValue;
    lastError: string | null;
    lastAttemptAt: Date | null;
    source: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      lotNumber: r.lotNumber.toString(),
      status: r.status,
      priority: r.priority,
      attempts: r.attempts,
      failedSequences: r.failedSequences ?? null,
      lastError: r.lastError,
      lastAttemptAt: r.lastAttemptAt,
      source: r.source,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  private imageCount(galleryCache: string | null): number {
    if (!galleryCache) return 0;
    try {
      const parsed = JSON.parse(galleryCache) as { imageCount?: number };
      return parsed.imageCount ?? 0;
    } catch {
      return 0;
    }
  }
}
