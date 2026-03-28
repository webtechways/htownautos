import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '@htownautos/rabbitmq';
import { PrismaService } from '@htownautos/prisma';
import { S3Service, ProxyService } from '@htownautos/common';

interface GalleryImage {
  sequence: number;
  thumbnail: string;
  fullSize: string;
}

interface GalleryCacheMessage {
  lotNumber: string;
  images: GalleryImage[];
}

const GALLERY_CACHE_QUEUE = 'gallery.cache';

@Injectable()
export class GalleryCacheService implements OnModuleInit {
  private readonly logger = new Logger(GalleryCacheService.name);

  constructor(
    private readonly rabbitMQ: RabbitMQService,
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly proxyService: ProxyService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQ.consume(GALLERY_CACHE_QUEUE, (msg) => this.handleMessage(msg as unknown as GalleryCacheMessage));
    this.logger.log(`Subscribed to ${GALLERY_CACHE_QUEUE} queue`);
  }

  private async handleMessage(msg: GalleryCacheMessage): Promise<void> {
    const { lotNumber, images } = msg;

    if (!lotNumber || !images?.length) {
      this.logger.warn(`[GalleryCache] Invalid message: missing lotNumber or images`);
      return;
    }

    this.logger.log(`[GalleryCache] Processing lot ${lotNumber} (${images.length} images)`);

    // Upload all images concurrently (thumbnail + fullSize per image)
    const uploadPromises = images.flatMap((img) => [
      this.uploadImage(lotNumber, img.sequence, 'thb', img.thumbnail),
      this.uploadImage(lotNumber, img.sequence, 'hrs', img.fullSize),
    ]);

    const results = await Promise.allSettled(uploadPromises);

    // Track which sequences succeeded (both thb and hrs must succeed)
    const successMap = new Map<number, { thumbnail?: string; fullSize?: string }>();

    for (let i = 0; i < images.length; i++) {
      const thbResult = results[i * 2];
      const hrsResult = results[i * 2 + 1];
      const seq = images[i].sequence;

      const entry: { thumbnail?: string; fullSize?: string } = {};

      if (thbResult.status === 'fulfilled' && thbResult.value) {
        entry.thumbnail = thbResult.value;
      }
      if (hrsResult.status === 'fulfilled' && hrsResult.value) {
        entry.fullSize = hrsResult.value;
      }

      if (entry.thumbnail || entry.fullSize) {
        successMap.set(seq, entry);
      }
    }

    const cachedImages = images
      .filter((img) => successMap.has(img.sequence))
      .map((img) => {
        const cached = successMap.get(img.sequence)!;
        return {
          sequence: img.sequence,
          thumbnail: cached.thumbnail || img.thumbnail,
          fullSize: cached.fullSize || img.fullSize,
        };
      });

    if (cachedImages.length === 0) {
      this.logger.error(`[GalleryCache] All uploads failed for lot ${lotNumber}`);
      return;
    }

    // Build cache object and save to DB
    const cacheData = {
      lotNumber,
      imageCount: cachedImages.length,
      images: cachedImages,
    };

    await this.prisma.auctionListing.update({
      where: { lotNumber: BigInt(lotNumber) },
      data: {
        galleryCache: JSON.stringify(cacheData),
        galleryCachedAt: new Date(),
      },
    });

    const failed = images.length - cachedImages.length;
    this.logger.log(
      `[GalleryCache] Lot ${lotNumber}: ${cachedImages.length}/${images.length} images cached` +
        (failed > 0 ? ` (${failed} failed)` : ''),
    );
  }

  private async uploadImage(
    lotNumber: string,
    sequence: number,
    suffix: string,
    sourceUrl: string,
  ): Promise<string | null> {
    if (!sourceUrl) return null;

    const key = `gallery/${lotNumber}/${sequence}_${suffix}.jpg`;

    try {
      // Download from Copart via proxy
      const response = await this.proxyService.fetchViaProxy(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${sourceUrl}: ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());

      // Upload buffer to S3
      await this.s3.uploadBufferToKey(buffer, key, 'image/jpeg', 'public-read');
      return this.s3.buildPublicUrl(key);
    } catch (error: any) {
      this.logger.warn(`[GalleryCache] Failed to upload ${key}: ${error.message}`);
      return null;
    }
  }
}
