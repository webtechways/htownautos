import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { RabbitMQService } from '@htownautos/rabbitmq';
import {
  CopartImagesService,
  ImageFetchBlockedError,
  GALLERY_CACHE_QUEUE,
} from '@htownautos/common';
import type { GalleryCacheMessage } from '@htownautos/common';
import { futureSaleWhere } from '@htownautos/auction-matching';

// Fallbacks if the singleton control row is missing.
const DEFAULT_LOTS_PER_TICK = 6;
const DEFAULT_MAX_ATTEMPTS = 5;

// Keep a buffer of pending jobs ready so the crawler never idles waiting on the
// seeder. When pending drops below the low-water mark, top up from un-cached lots.
const SEED_LOW_WATER = 200;
const SEED_BATCH = 500;

// Processing jobs older than this were orphaned (consumer/worker died) — requeue.
const STALE_PROCESSING_MIN = 15;

/**
 * Drains the ImageCacheJob queue at a controlled, pausable rate so Copart is hit
 * gently. Also seeds the queue from the backlog of un-cached lots, prioritized by
 * soonest auction date. Runs in data-sync (has Schedule + RabbitMQ + Prisma).
 *
 * Per tick (when not paused):
 *   1. Requeue orphaned `processing` jobs.
 *   2. Top up `pending` jobs from the un-cached backlog (soonest saleDate first).
 *   3. Claim up to `lotsPerTick` pending jobs; for each, fetch the Copart image
 *      list via the proxy and publish to `gallery.cache` (image-service uploads to
 *      S3 and finalizes the job). Already-cached lots are closed as `done`.
 */
@Injectable()
export class ImageCacheCrawlerService {
  private readonly logger = new Logger(ImageCacheCrawlerService.name);
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMQ: RabbitMQService,
    private readonly copartImages: CopartImagesService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    if (this.isRunning) return; // never overlap
    this.isRunning = true;
    try {
      const config = await this.prisma.imageScrapeConfig.findUnique({
        where: { id: 'singleton' },
      });
      if (config?.paused) return;

      const lotsPerTick = config?.lotsPerTick ?? DEFAULT_LOTS_PER_TICK;
      const maxAttempts = config?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

      await this.requeueOrphans();
      await this.topUpQueue();
      await this.dispatch(lotsPerTick, maxAttempts);
    } catch (err) {
      this.logger.error(`[ImageCacheCrawler] Tick failed: ${(err as Error).message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /** Requeue `processing` jobs abandoned by a dead consumer/worker. */
  private async requeueOrphans(): Promise<void> {
    const cutoff = new Date(Date.now() - STALE_PROCESSING_MIN * 60_000);
    const res = await this.prisma.imageCacheJob.updateMany({
      where: { status: 'processing', lastAttemptAt: { lt: cutoff } },
      data: { status: 'pending' },
    });
    if (res.count > 0) {
      this.logger.warn(`[ImageCacheCrawler] Requeued ${res.count} orphaned processing job(s)`);
    }
  }

  /**
   * Seed the queue from the backlog of un-cached, future-sale Copart lots when
   * pending work runs low. Uses a raw INSERT ... SELECT so the whole backlog is
   * never loaded into memory; skips lots that already have a job row.
   */
  private async topUpQueue(): Promise<void> {
    const pending = await this.prisma.imageCacheJob.count({ where: { status: 'pending' } });
    if (pending >= SEED_LOW_WATER) return;

    // futureSaleWhere() → { OR: [{ saleDate: null }, { saleDate: { gte: todayInt - 1 } }] }
    const future = futureSaleWhere() as { OR?: Array<{ saleDate?: { gte?: number } }> };
    const saleFloor =
      future.OR?.find((c) => typeof c.saleDate?.gte === 'number')?.saleDate?.gte ?? 0;

    // INSERT missing lots as pending backfill jobs, soonest auction first.
    const inserted = await this.prisma.$executeRaw`
      INSERT INTO "image_cache_jobs" ("lotNumber", "status", "priority", "source", "updatedAt")
      SELECT al."lotNumber", 'pending', al."saleDate", 'backfill', NOW()
      FROM "auction_listings" al
      WHERE al."auctionName" = 'Copart'
        AND al."galleryCache" IS NULL
        AND al."isStale" = false
        AND al."discarded" = false
        AND (al."saleDate" IS NULL OR al."saleDate" >= ${saleFloor})
        AND NOT EXISTS (SELECT 1 FROM "image_cache_jobs" j WHERE j."lotNumber" = al."lotNumber")
      ORDER BY al."saleDate" ASC NULLS LAST
      LIMIT ${SEED_BATCH}
      ON CONFLICT ("lotNumber") DO NOTHING
    `;
    if (inserted > 0) {
      this.logger.log(`[ImageCacheCrawler] Seeded ${inserted} lot(s) into the queue from backlog`);
    }
  }

  /** Claim and dispatch up to `lotsPerTick` pending jobs. */
  private async dispatch(lotsPerTick: number, maxAttempts: number): Promise<void> {
    const jobs = await this.prisma.imageCacheJob.findMany({
      where: { status: 'pending' },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      take: lotsPerTick,
      select: { lotNumber: true, attempts: true },
    });
    if (jobs.length === 0) return;

    for (const job of jobs) {
      const lotNumber = job.lotNumber.toString();

      // Mark processing + bump attempts (job-level dispatch count, not proxy retries).
      await this.prisma.imageCacheJob.update({
        where: { lotNumber: job.lotNumber },
        data: { status: 'processing', attempts: { increment: 1 }, lastAttemptAt: new Date() },
      });

      // Skip if it was cached on-demand meanwhile.
      const listing = await this.prisma.auctionListing.findUnique({
        where: { lotNumber: job.lotNumber },
        select: { galleryCache: true },
      });
      if (listing?.galleryCache) {
        await this.markDone(job.lotNumber);
        continue;
      }

      try {
        const images = await this.copartImages.fetchImages(lotNumber, { maxAttempts });
        if (images.length === 0) {
          await this.markFailed(job.lotNumber, 'No images returned from Copart (empty/404)');
          continue;
        }
        const msg: GalleryCacheMessage = { lotNumber, images, jobId: lotNumber };
        const ok = await this.rabbitMQ.publish(GALLERY_CACHE_QUEUE, msg);
        if (!ok) {
          // Queue unavailable — leave it for the next tick.
          await this.prisma.imageCacheJob.update({
            where: { lotNumber: job.lotNumber },
            data: { status: 'pending', lastError: 'RabbitMQ unavailable' },
          });
        }
        // On success the image-service consumer finalizes the job (done/failed).
      } catch (err) {
        if (err instanceof ImageFetchBlockedError) {
          await this.markFailed(job.lotNumber, `Blocked after ${err.attempts} attempts (status ${err.lastStatus ?? 'n/a'})`);
        } else {
          await this.markFailed(job.lotNumber, (err as Error).message);
        }
      }
    }
  }

  private async markDone(lotNumber: bigint): Promise<void> {
    await this.prisma.imageCacheJob.update({
      where: { lotNumber },
      data: { status: 'done', lastError: null, failedSequences: Prisma.DbNull },
    });
  }

  private async markFailed(lotNumber: bigint, error: string): Promise<void> {
    await this.prisma.imageCacheJob.update({
      where: { lotNumber },
      data: { status: 'failed', lastError: error, lastAttemptAt: new Date() },
    });
  }
}
