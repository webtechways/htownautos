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
var UploadSessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadSessionService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const crypto_1 = require("crypto");
const prisma_1 = require("@htownautos/prisma");
const media_1 = require("@htownautos/media");
const media_2 = require("@htownautos/media");
const SESSION_TTL_MINUTES = 15;
let UploadSessionService = UploadSessionService_1 = class UploadSessionService {
    prisma;
    mediaService;
    logger = new common_1.Logger(UploadSessionService_1.name);
    constructor(prisma, mediaService) {
        this.prisma = prisma;
        this.mediaService = mediaService;
    }
    async create(dto, userId, tenantId) {
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);
        const session = await this.prisma.uploadSession.create({
            data: {
                token,
                expiresAt,
                entityType: dto.entityType,
                entityId: dto.entityId,
                mediaType: dto.mediaType || 'image',
                category: dto.category,
                isPublic: dto.isPublic ?? true,
                userId,
                tenantId,
            },
        });
        return {
            token: session.token,
            expiresAt: session.expiresAt,
        };
    }
    async validate(token) {
        const session = await this.prisma.uploadSession.findUnique({
            where: { token },
        });
        if (!session) {
            throw new common_1.NotFoundException('Upload session not found');
        }
        if (session.closed) {
            throw new common_1.BadRequestException('Upload session has been closed');
        }
        if (new Date() > session.expiresAt) {
            throw new common_1.BadRequestException('Upload session has expired');
        }
        if (!session.used) {
            await this.prisma.uploadSession.update({
                where: { id: session.id },
                data: { used: true },
            });
        }
        return session;
    }
    async getPublicInfo(token) {
        const session = await this.validate(token);
        return {
            entityType: session.entityType,
            mediaType: session.mediaType,
            category: session.category,
            isPublic: session.isPublic,
            expiresAt: session.expiresAt,
        };
    }
    async presign(token, dto) {
        const session = await this.validate(token);
        const presignDto = {
            ...dto,
            mediaType: session.mediaType || dto.mediaType,
            category: session.category || dto.category,
            isPublic: session.isPublic,
        };
        if (session.entityType === 'vehicle') {
            presignDto.vehicleId = session.entityId;
        }
        else if (session.entityType === 'buyer') {
            presignDto.buyerId = session.entityId;
        }
        return this.mediaService.presign(presignDto);
    }
    async confirm(token, dto) {
        const session = await this.validate(token);
        const confirmDto = {
            ...dto,
            mediaType: session.mediaType || dto.mediaType,
            category: session.category || dto.category,
            isPublic: session.isPublic,
        };
        if (session.entityType === 'vehicle') {
            confirmDto.vehicleId = session.entityId;
        }
        else if (session.entityType === 'buyer') {
            confirmDto.buyerId = session.entityId;
        }
        return this.mediaService.confirmUpload(confirmDto);
    }
    async getSessionMedia(token) {
        const session = await this.prisma.uploadSession.findUnique({
            where: { token },
        });
        if (!session) {
            throw new common_1.NotFoundException('Upload session not found');
        }
        const where = {
            createdAt: { gte: session.createdAt },
        };
        if (session.entityType === 'vehicle') {
            where.vehicleId = session.entityId;
        }
        else if (session.entityType === 'buyer') {
            where.buyerId = session.entityId;
        }
        if (session.category) {
            where.category = session.category;
        }
        const media = await this.prisma.media.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return media.map((m) => new media_2.MediaEntity(m));
    }
    async close(token, userId) {
        const session = await this.prisma.uploadSession.findUnique({
            where: { token },
        });
        if (!session) {
            throw new common_1.NotFoundException('Upload session not found');
        }
        if (session.userId !== userId) {
            throw new common_1.BadRequestException('Not authorized to close this session');
        }
        await this.prisma.uploadSession.update({
            where: { id: session.id },
            data: { closed: true },
        });
        return { message: 'Session closed' };
    }
    async cleanupExpiredSessions() {
        try {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const result = await this.prisma.uploadSession.deleteMany({
                where: {
                    expiresAt: { lt: cutoff },
                },
            });
            if (result.count > 0) {
                this.logger.log(`Cleaned up ${result.count} expired upload sessions`);
            }
        }
        catch {
            this.logger.warn('Failed to cleanup expired upload sessions (database unreachable)');
        }
    }
};
exports.UploadSessionService = UploadSessionService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UploadSessionService.prototype, "cleanupExpiredSessions", null);
exports.UploadSessionService = UploadSessionService = UploadSessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        media_1.MediaService])
], UploadSessionService);
//# sourceMappingURL=upload-session.service.js.map