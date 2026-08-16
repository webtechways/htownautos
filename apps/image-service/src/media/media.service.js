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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const media_entity_1 = require("./entities/media.entity");
const sharp_1 = __importDefault(require("sharp"));
let MediaService = MediaService_1 = class MediaService {
    prisma;
    s3Service;
    logger = new common_1.Logger(MediaService_1.name);
    constructor(prisma, s3Service) {
        this.prisma = prisma;
        this.s3Service = s3Service;
    }
    IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    MAX_DIMENSION = 2400;
    JPEG_QUALITY = 82;
    WEBP_QUALITY = 80;
    async optimizeImage(file) {
        if (!this.IMAGE_MIMES.includes(file.mimetype))
            return file;
        try {
            const image = (0, sharp_1.default)(file.buffer);
            const metadata = await image.metadata();
            const needsResize = (metadata.width && metadata.width > this.MAX_DIMENSION) ||
                (metadata.height && metadata.height > this.MAX_DIMENSION);
            let pipeline = image;
            if (needsResize) {
                pipeline = pipeline.resize(this.MAX_DIMENSION, this.MAX_DIMENSION, {
                    fit: 'inside',
                    withoutEnlargement: true,
                });
            }
            pipeline = pipeline.rotate();
            let outputBuffer;
            let outputMime;
            let outputName;
            if (file.mimetype === 'image/png' && metadata.hasAlpha) {
                outputBuffer = await pipeline.png({ quality: 90, compressionLevel: 9 }).toBuffer();
                outputMime = 'image/png';
                outputName = file.originalname;
            }
            else if (file.mimetype === 'image/gif') {
                return file;
            }
            else {
                outputBuffer = await pipeline.webp({ quality: this.WEBP_QUALITY }).toBuffer();
                outputMime = 'image/webp';
                outputName = file.originalname.replace(/\.[^.]+$/, '.webp');
            }
            const savedBytes = file.buffer.length - outputBuffer.length;
            if (savedBytes > 0) {
                this.logger.log(`[Sharp] Optimized ${file.originalname}: ${(file.buffer.length / 1024).toFixed(0)}KB → ${(outputBuffer.length / 1024).toFixed(0)}KB (saved ${(savedBytes / 1024).toFixed(0)}KB)`);
                return {
                    ...file,
                    buffer: outputBuffer,
                    size: outputBuffer.length,
                    mimetype: outputMime,
                    originalname: outputName,
                };
            }
            return file;
        }
        catch (error) {
            this.logger.warn(`[Sharp] Failed to optimize ${file.originalname}: ${error.message}`);
            return file;
        }
    }
    async uploadAndCreate(file, createMediaDto) {
        file = await this.optimizeImage(file);
        if (createMediaDto.vehicleId) {
            const exists = await this.prisma.vehicle.findUnique({
                where: { id: createMediaDto.vehicleId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Vehicle with ID ${createMediaDto.vehicleId} not found`);
            }
        }
        if (createMediaDto.buyerId) {
            const exists = await this.prisma.buyer.findUnique({
                where: { id: createMediaDto.buyerId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Buyer with ID ${createMediaDto.buyerId} not found`);
            }
        }
        if (createMediaDto.partId) {
            const exists = await this.prisma.part.findUnique({
                where: { id: createMediaDto.partId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Part with ID ${createMediaDto.partId} not found`);
            }
        }
        const isPrivate = !!createMediaDto.buyerId || !(createMediaDto.isPublic ?? true);
        let folder = 'uploads';
        if (createMediaDto.buyerId) {
            folder = `buyers/${createMediaDto.buyerId}`;
        }
        else if (createMediaDto.vehicleId) {
            folder = `vehicles/${createMediaDto.vehicleId}`;
        }
        else if (createMediaDto.partId) {
            folder = `parts/${createMediaDto.partId}`;
        }
        const uploadResult = await this.s3Service.uploadFile(file, folder, isPrivate);
        try {
            const media = await this.prisma.media.create({
                data: {
                    filename: file.originalname,
                    url: uploadResult.url,
                    path: uploadResult.key,
                    mimeType: uploadResult.mimeType,
                    size: uploadResult.size,
                    mediaType: createMediaDto.mediaType,
                    category: createMediaDto.category,
                    title: createMediaDto.title,
                    description: createMediaDto.description,
                    alt: createMediaDto.alt,
                    storageProvider: 's3',
                    storageBucket: uploadResult.bucket,
                    storageKey: uploadResult.key,
                    isPublic: !isPrivate,
                    isActive: true,
                    ...(createMediaDto.vehicleId && { vehicleId: createMediaDto.vehicleId }),
                    ...(createMediaDto.buyerId && { buyerId: createMediaDto.buyerId }),
                    ...(createMediaDto.partId && { partId: createMediaDto.partId }),
                    ...(createMediaDto.inspectionId && { inspectionId: createMediaDto.inspectionId }),
                    ...(createMediaDto.inspectionChecklistItemId && {
                        inspectionChecklistItemId: createMediaDto.inspectionChecklistItemId,
                    }),
                    ...(createMediaDto.inspectionRequestItemId && {
                        inspectionRequestItemId: createMediaDto.inspectionRequestItemId,
                    }),
                    ...(createMediaDto.inspectionErrorCodeId && {
                        inspectionErrorCodeId: createMediaDto.inspectionErrorCodeId,
                    }),
                    ...(createMediaDto.carfaxReportId && { carfaxReportId: createMediaDto.carfaxReportId }),
                },
            });
            return new media_entity_1.MediaEntity(media);
        }
        catch (error) {
            this.logger.warn(`DB create failed, cleaning up S3 key: ${uploadResult.key}`);
            try {
                await this.s3Service.deleteFile(uploadResult.key);
            }
            catch (cleanupErr) {
                this.logger.error(`Failed to clean up orphaned S3 file: ${uploadResult.key}`, cleanupErr);
            }
            throw error;
        }
    }
    async presign(dto) {
        if (dto.vehicleId) {
            const exists = await this.prisma.vehicle.findUnique({
                where: { id: dto.vehicleId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
            }
        }
        if (dto.buyerId) {
            const exists = await this.prisma.buyer.findUnique({
                where: { id: dto.buyerId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Buyer with ID ${dto.buyerId} not found`);
            }
        }
        if (dto.partId) {
            const exists = await this.prisma.part.findUnique({
                where: { id: dto.partId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Part with ID ${dto.partId} not found`);
            }
        }
        const isPrivate = !!dto.buyerId || !(dto.isPublic ?? true);
        let folder = 'uploads';
        if (dto.buyerId) {
            folder = `buyers/${dto.buyerId}`;
        }
        else if (dto.vehicleId) {
            folder = `vehicles/${dto.vehicleId}`;
        }
        else if (dto.partId) {
            folder = `parts/${dto.partId}`;
        }
        const fileExtension = dto.filename.split('.').pop() || 'bin';
        return this.s3Service.generatePresignedPutUrl(folder, fileExtension, dto.contentType, isPrivate);
    }
    async confirmUpload(dto) {
        const head = await this.s3Service.headObject(dto.key);
        if (!head.exists) {
            throw new common_1.BadRequestException('File not found in S3. Upload may have failed.');
        }
        const maxSize = 20 * 1024 * 1024;
        if (head.contentLength > maxSize) {
            this.logger.warn(`File exceeds max size, deleting: ${dto.key} (${head.contentLength} bytes)`);
            await this.s3Service.deleteFile(dto.key);
            throw new common_1.BadRequestException(`File exceeds maximum size of 20MB`);
        }
        if (dto.vehicleId) {
            const exists = await this.prisma.vehicle.findUnique({
                where: { id: dto.vehicleId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
            }
        }
        if (dto.buyerId) {
            const exists = await this.prisma.buyer.findUnique({
                where: { id: dto.buyerId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Buyer with ID ${dto.buyerId} not found`);
            }
        }
        if (dto.partId) {
            const exists = await this.prisma.part.findUnique({
                where: { id: dto.partId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Part with ID ${dto.partId} not found`);
            }
        }
        const isPrivate = !!dto.buyerId || !(dto.isPublic ?? true);
        const publicUrl = this.s3Service.buildPublicUrl(dto.key);
        try {
            const media = await this.prisma.media.create({
                data: {
                    filename: dto.filename,
                    url: publicUrl,
                    path: dto.key,
                    mimeType: dto.contentType,
                    size: head.contentLength,
                    mediaType: dto.mediaType,
                    category: dto.category,
                    title: dto.title,
                    description: dto.description,
                    alt: dto.alt,
                    storageProvider: 's3',
                    storageBucket: process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_PUBLIC || '',
                    storageKey: dto.key,
                    isPublic: !isPrivate,
                    isActive: true,
                    ...(dto.vehicleId && { vehicleId: dto.vehicleId }),
                    ...(dto.buyerId && { buyerId: dto.buyerId }),
                    ...(dto.partId && { partId: dto.partId }),
                    ...(dto.inspectionId && { inspectionId: dto.inspectionId }),
                    ...(dto.inspectionChecklistItemId && {
                        inspectionChecklistItemId: dto.inspectionChecklistItemId,
                    }),
                    ...(dto.inspectionRequestItemId && {
                        inspectionRequestItemId: dto.inspectionRequestItemId,
                    }),
                    ...(dto.inspectionErrorCodeId && {
                        inspectionErrorCodeId: dto.inspectionErrorCodeId,
                    }),
                    ...(dto.carfaxReportId && { carfaxReportId: dto.carfaxReportId }),
                },
            });
            return new media_entity_1.MediaEntity(media);
        }
        catch (error) {
            this.logger.warn(`DB create failed, cleaning up S3 key: ${dto.key}`);
            try {
                await this.s3Service.deleteFile(dto.key);
            }
            catch (cleanupErr) {
                this.logger.error(`Failed to clean up orphaned S3 file: ${dto.key}`, cleanupErr);
            }
            throw error;
        }
    }
    MULTIPART_PART_SIZE = 8 * 1024 * 1024;
    MULTIPART_MAX_PARTS = 10000;
    folderForDto(dto) {
        if (dto.buyerId)
            return `buyers/${dto.buyerId}`;
        if (dto.vehicleId)
            return `vehicles/${dto.vehicleId}`;
        if (dto.partId)
            return `parts/${dto.partId}`;
        return 'uploads';
    }
    async initMultipart(dto) {
        if (dto.vehicleId) {
            const exists = await this.prisma.vehicle.findUnique({
                where: { id: dto.vehicleId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
            }
        }
        if (dto.buyerId) {
            const exists = await this.prisma.buyer.findUnique({
                where: { id: dto.buyerId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Buyer with ID ${dto.buyerId} not found`);
            }
        }
        if (dto.partId) {
            const exists = await this.prisma.part.findUnique({
                where: { id: dto.partId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Part with ID ${dto.partId} not found`);
            }
        }
        const partSize = this.MULTIPART_PART_SIZE;
        const partCount = Math.ceil(dto.fileSize / partSize);
        if (partCount < 1 || partCount > this.MULTIPART_MAX_PARTS) {
            throw new common_1.BadRequestException(`Invalid part count ${partCount} for file size ${dto.fileSize}`);
        }
        const folder = this.folderForDto(dto);
        const fileExtension = dto.filename.split('.').pop() || 'bin';
        const key = this.s3Service.generateKey(folder, fileExtension);
        const { uploadId } = await this.s3Service.initMultipartUpload(key, dto.contentType);
        const partUrls = await Promise.all(Array.from({ length: partCount }, (_, i) => i + 1).map(async (partNumber) => ({
            partNumber,
            url: await this.s3Service.presignUploadPart(key, uploadId, partNumber),
        })));
        this.logger.log(`Multipart init: key=${key} parts=${partCount} size=${dto.fileSize}`);
        return { uploadId, key, partUrls, partSize, partCount };
    }
    async completeMultipart(dto) {
        await this.s3Service.completeMultipartUpload(dto.key, dto.uploadId, dto.parts.map((p) => ({ partNumber: p.partNumber, etag: p.etag })));
        const head = await this.s3Service.headObject(dto.key);
        if (!head.exists) {
            throw new common_1.BadRequestException('Multipart upload completed but object is not visible in S3');
        }
        if (dto.vehicleId) {
            const exists = await this.prisma.vehicle.findUnique({
                where: { id: dto.vehicleId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
            }
        }
        if (dto.buyerId) {
            const exists = await this.prisma.buyer.findUnique({
                where: { id: dto.buyerId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Buyer with ID ${dto.buyerId} not found`);
            }
        }
        if (dto.partId) {
            const exists = await this.prisma.part.findUnique({
                where: { id: dto.partId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Part with ID ${dto.partId} not found`);
            }
        }
        const isPrivate = !!dto.buyerId || !(dto.isPublic ?? true);
        const publicUrl = this.s3Service.buildPublicUrl(dto.key);
        try {
            const media = await this.prisma.media.create({
                data: {
                    filename: dto.filename,
                    url: publicUrl,
                    path: dto.key,
                    mimeType: dto.contentType,
                    size: head.contentLength,
                    mediaType: dto.mediaType,
                    category: dto.category,
                    title: dto.title,
                    description: dto.description,
                    alt: dto.alt,
                    storageProvider: 's3',
                    storageBucket: process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_PUBLIC || '',
                    storageKey: dto.key,
                    isPublic: !isPrivate,
                    isActive: true,
                    ...(dto.vehicleId && { vehicleId: dto.vehicleId }),
                    ...(dto.buyerId && { buyerId: dto.buyerId }),
                    ...(dto.partId && { partId: dto.partId }),
                    ...(dto.inspectionId && { inspectionId: dto.inspectionId }),
                    ...(dto.inspectionChecklistItemId && {
                        inspectionChecklistItemId: dto.inspectionChecklistItemId,
                    }),
                    ...(dto.inspectionRequestItemId && {
                        inspectionRequestItemId: dto.inspectionRequestItemId,
                    }),
                    ...(dto.inspectionErrorCodeId && {
                        inspectionErrorCodeId: dto.inspectionErrorCodeId,
                    }),
                    ...(dto.carfaxReportId && { carfaxReportId: dto.carfaxReportId }),
                },
            });
            return new media_entity_1.MediaEntity(media);
        }
        catch (error) {
            this.logger.warn(`DB create failed after multipart, cleaning up S3 key: ${dto.key}`);
            try {
                await this.s3Service.deleteFile(dto.key);
            }
            catch (cleanupErr) {
                this.logger.error(`Failed to clean up orphaned S3 object: ${dto.key}`, cleanupErr);
            }
            throw error;
        }
    }
    async abortMultipart(dto) {
        await this.s3Service.abortMultipartUpload(dto.key, dto.uploadId);
        return { aborted: true };
    }
    async findAll(query) {
        const { page = 1, limit = 10, vehicleId, buyerId, partId, mediaType, category, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (vehicleId !== undefined) {
            const exists = await this.prisma.vehicle.findUnique({
                where: { id: vehicleId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Vehicle with ID ${vehicleId} not found`);
            }
            where.vehicleId = vehicleId;
        }
        if (buyerId !== undefined) {
            const exists = await this.prisma.buyer.findUnique({
                where: { id: buyerId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Buyer with ID ${buyerId} not found`);
            }
            where.buyerId = buyerId;
        }
        if (partId !== undefined) {
            const exists = await this.prisma.part.findUnique({
                where: { id: partId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Part with ID ${partId} not found`);
            }
            where.partId = partId;
        }
        if (mediaType !== undefined)
            where.mediaType = mediaType;
        if (category !== undefined)
            where.category = category;
        if (isActive !== undefined)
            where.isActive = isActive;
        const [data, total] = await Promise.all([
            this.prisma.media.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.media.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: data.map((item) => new media_entity_1.MediaEntity(item)),
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id) {
        const media = await this.prisma.media.findUnique({
            where: { id },
        });
        if (!media) {
            throw new common_1.NotFoundException(`Media with ID ${id} not found`);
        }
        return new media_entity_1.MediaEntity(media);
    }
    async update(id, updateMediaDto) {
        const existingMedia = await this.prisma.media.findUnique({
            where: { id },
        });
        if (!existingMedia) {
            throw new common_1.NotFoundException(`Media with ID ${id} not found`);
        }
        if (updateMediaDto.vehicleId && updateMediaDto.vehicleId !== existingMedia.vehicleId) {
            const exists = await this.prisma.vehicle.findUnique({
                where: { id: updateMediaDto.vehicleId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Vehicle with ID ${updateMediaDto.vehicleId} not found`);
            }
        }
        if (updateMediaDto.buyerId && updateMediaDto.buyerId !== existingMedia.buyerId) {
            const exists = await this.prisma.buyer.findUnique({
                where: { id: updateMediaDto.buyerId },
                select: { id: true },
            });
            if (!exists) {
                throw new common_1.NotFoundException(`Buyer with ID ${updateMediaDto.buyerId} not found`);
            }
        }
        const forcePrivate = updateMediaDto.buyerId || existingMedia.buyerId;
        const finalIsPublic = forcePrivate ? false : (updateMediaDto.isPublic ?? existingMedia.isPublic);
        const updated = await this.prisma.media.update({
            where: { id },
            data: {
                ...(updateMediaDto.title !== undefined && { title: updateMediaDto.title }),
                ...(updateMediaDto.description !== undefined && { description: updateMediaDto.description }),
                ...(updateMediaDto.alt !== undefined && { alt: updateMediaDto.alt }),
                ...(updateMediaDto.category !== undefined && { category: updateMediaDto.category }),
                ...(updateMediaDto.vehicleId !== undefined && { vehicleId: updateMediaDto.vehicleId }),
                ...(updateMediaDto.buyerId !== undefined && { buyerId: updateMediaDto.buyerId }),
                isPublic: finalIsPublic,
            },
        });
        return new media_entity_1.MediaEntity(updated);
    }
    async remove(id) {
        const existingMedia = await this.prisma.media.findUnique({
            where: { id },
        });
        if (!existingMedia) {
            throw new common_1.NotFoundException(`Media with ID ${id} not found`);
        }
        if (existingMedia.storageKey) {
            try {
                await this.s3Service.deleteFile(existingMedia.storageKey);
            }
            catch (error) {
                this.logger.error(`Error deleting file from S3: ${existingMedia.storageKey}`, error);
            }
        }
        await this.prisma.media.delete({
            where: { id },
        });
        return {
            message: `Media with ID ${id} has been successfully deleted`,
        };
    }
    async getSignedUrl(id, expiresIn = 3600) {
        const media = await this.findOne(id);
        if (!media.storageKey) {
            throw new common_1.BadRequestException('Media does not have a storage key');
        }
        const url = await this.s3Service.getSignedUrl(media.storageKey, expiresIn);
        return { url };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        common_2.S3Service])
], MediaService);
//# sourceMappingURL=media.service.js.map