import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';

/** How many lotNumbers to pack into a single `lotNumber IN (...)` clause. */
const LOT_IN_CHUNK = 1_000;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Enqueues brand-new Copart lots for proactive image caching. Called from the
 * sync pipeline right after `newLotNumbers` are known. It only creates work
 * items (ImageCacheJob rows) — the pausable crawler drains them at a controlled
 * rate. This step is uncontrolled by design (logs only): flooding the *queue* is
 * harmless; the crawler governs how fast Copart is actually hit.
 *
 * Skips lots that already have a cached gallery (`galleryCache` set) and lots
 * that already have a job row (PK conflict → skipDuplicates).
 */
@Injectable()
export class ImageCacheEnqueuerService {
  private readonly logger = new Logger(ImageCacheEnqueuerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async enqueueNewLots(lotNumberStrings: string[]): Promise<number> {
    if (!lotNumberStrings.length) return 0;

    const lots = lotNumberStrings.map((s) => BigInt(s));
    let enqueued = 0;

    for (const batch of chunk(lots, LOT_IN_CHUNK)) {
      // Only enqueue lots that still lack a cached gallery; carry saleDate as the
      // crawler priority (soonest auction first).
      const listings = await this.prisma.auctionListing.findMany({
        where: { lotNumber: { in: batch }, galleryCache: null },
        select: { lotNumber: true, saleDate: true },
      });
      if (!listings.length) continue;

      const res = await this.prisma.imageCacheJob.createMany({
        data: listings.map((l) => ({
          lotNumber: l.lotNumber,
          priority: l.saleDate ?? null,
          status: 'pending',
          source: 'new_lot',
        })),
        skipDuplicates: true,
      });
      enqueued += res.count;
    }

    this.logger.log(
      `[ImageCacheEnqueuer] Enqueued ${enqueued}/${lotNumberStrings.length} new lot(s) for image caching`,
    );
    return enqueued;
  }
}
