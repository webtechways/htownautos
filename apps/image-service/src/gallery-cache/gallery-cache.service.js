"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GalleryCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryCacheService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_1 = require("@htownautos/rabbitmq");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const GALLERY_CACHE_QUEUE = 'gallery.cache';
let GalleryCacheService = GalleryCacheService_1 = class GalleryCacheService {
    rabbitMQ;
    prisma;
    s3;
    proxyService;
    logger = new common_1.Logger(GalleryCacheService_1.name);
    constructor(rabbitMQ, prisma, s3, proxyService) {
        this.rabbitMQ = rabbitMQ;
        this.prisma = prisma;
        this.s3 = s3;
        this.proxyService = proxyService;
    }
    async onModuleInit() {
        await this.rabbitMQ.consume(GALLERY_CACHE_QUEUE, (msg) => this.handleMessage(msg));
        this.logger.log(`Subscribed to ${GALLERY_CACHE_QUEUE} queue`);
    }
    async handleMessage(msg) {
        const { lotNumber, images } = msg;
        if (!lotNumber || !images?.length) {
            this.logger.warn(`[GalleryCache] Invalid message: missing lotNumber or images`);
            return;
        }
        this.logger.log(`[GalleryCache] Processing lot ${lotNumber} (${images.length} images)`);
        const uploadPromises = images.flatMap((img) => [
            this.uploadImage(lotNumber, img.sequence, 'thb', img.thumbnail),
            this.uploadImage(lotNumber, img.sequence, 'hrs', img.fullSize),
        ]);
        const results = await Promise.allSettled(uploadPromises);
        const successMap = new Map();
        for (let i = 0; i < images.length; i++) {
            const thbResult = results[i * 2];
            const hrsResult = results[i * 2 + 1];
            const seq = images[i].sequence;
            const entry = {};
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
            const cached = successMap.get(img.sequence);
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
        this.logger.log(`[GalleryCache] Lot ${lotNumber}: ${cachedImages.length}/${images.length} images cached` +
            (failed > 0 ? ` (${failed} failed)` : ''));
    }
    async uploadImage(lotNumber, sequence, suffix, sourceUrl) {
        if (!sourceUrl)
            return null;
        const key = `gallery/${lotNumber}/${sequence}_${suffix}.jpg`;
        try {
            const response = await this.proxyService.fetchViaProxy(sourceUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${sourceUrl}: ${response.status}`);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            await this.s3.uploadBufferToKey(buffer, key, 'image/jpeg', 'public-read');
            return this.s3.buildPublicUrl(key);
        }
        catch (error) {
            this.logger.warn(`[GalleryCache] Failed to upload ${key}: ${error.message}`);
            return null;
        }
    }
};
exports.GalleryCacheService = GalleryCacheService;
exports.GalleryCacheService = GalleryCacheService = GalleryCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_1.RabbitMQService,
        prisma_1.PrismaService,
        common_2.S3Service,
        common_2.ProxyService])
], GalleryCacheService);
//# sourceMappingURL=gallery-cache.service.js.map