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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, userId, data) {
        return this.prisma.notification.create({
            data: {
                tenantId,
                userId,
                title: data.title,
                message: data.message,
                type: data.type,
                entityType: data.entityType ?? null,
                entityId: data.entityId ?? null,
                actionUrl: data.actionUrl ?? null,
                priority: data.priority ?? 'normal',
                metaValue: data.metaValue != null
                    ? data.metaValue
                    : undefined,
            },
        });
    }
    async notifyTenantStaff(tenantId, data) {
        try {
            const staff = await this.prisma.tenantUser.findMany({
                where: { tenantId, status: 'active', isActive: true },
                select: { userId: true },
            });
            if (staff.length === 0)
                return;
            const userIds = Array.from(new Set(staff.map((s) => s.userId)));
            const metaValue = data.metaValue != null
                ? data.metaValue
                : undefined;
            await this.prisma.notification.createMany({
                data: userIds.map((userId) => ({
                    tenantId,
                    userId,
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    entityType: data.entityType ?? null,
                    entityId: data.entityId ?? null,
                    actionUrl: data.actionUrl ?? null,
                    priority: data.priority ?? 'normal',
                    metaValue,
                })),
                skipDuplicates: true,
            });
        }
        catch (err) {
            this.logger.warn(`notifyTenantStaff: tenant=${tenantId} type=${data.type} — ${err.message}`);
        }
    }
    async list(userId, tenantId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {
            userId,
            tenantId,
            ...(query.unreadOnly ? { isRead: false } : {}),
        };
        const [items, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async unreadCount(userId, tenantId) {
        return this.prisma.notification.count({
            where: { userId, tenantId, isRead: false },
        });
    }
    async markRead(id, userId) {
        await this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true, readAt: new Date() },
        });
        return { ok: true };
    }
    async markAllRead(userId, tenantId) {
        const { count } = await this.prisma.notification.updateMany({
            where: { userId, tenantId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        return { ok: true, updated: count };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map