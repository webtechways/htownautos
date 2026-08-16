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
var PresenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("@htownautos/redis");
const prisma_1 = require("@htownautos/prisma");
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;
let PresenceService = PresenceService_1 = class PresenceService {
    redis;
    prisma;
    logger = new common_1.Logger(PresenceService_1.name);
    constructor(redis, prisma) {
        this.redis = redis;
        this.prisma = prisma;
    }
    async setUserOnline(clerkUserId, tenantId) {
        const user = await this.prisma.user.findUnique({
            where: { clerkUserId },
            select: { id: true },
        });
        if (!user) {
            this.logger.warn(`User with clerkUserId ${clerkUserId} not found`);
            return;
        }
        const userId = user.id;
        const key = `presence:${tenantId}:${userId}`;
        const now = Date.now();
        await this.redis.getClient().setex(key, 300, now.toString());
        await this.redis.getClient().sadd(`presence:tenant:${tenantId}`, userId);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isOnline: true,
                lastActivityAt: new Date(),
            },
        });
        this.logger.log(`User ${userId} is now online in tenant ${tenantId}`);
    }
    async updateActivity(userId, tenantId) {
        const key = `presence:${tenantId}:${userId}`;
        const now = Date.now();
        await this.redis.getClient().setex(key, 300, now.toString());
        await this.redis.getClient().sadd(`presence:tenant:${tenantId}`, userId);
    }
    async isUserOnline(userId, tenantId) {
        const key = `presence:${tenantId}:${userId}`;
        const lastActivity = await this.redis.getClient().get(key);
        if (!lastActivity) {
            return false;
        }
        const lastActivityTime = parseInt(lastActivity, 10);
        const isOnline = Date.now() - lastActivityTime < ONLINE_THRESHOLD_MS;
        return isOnline;
    }
    async getOnlineUsers(tenantId) {
        const userIds = await this.redis.getClient().smembers(`presence:tenant:${tenantId}`);
        if (userIds.length === 0) {
            return [];
        }
        const presencePromises = userIds.map(async (userId) => {
            const isOnline = await this.isUserOnline(userId, tenantId);
            const key = `presence:${tenantId}:${userId}`;
            const lastActivity = await this.redis.getClient().get(key);
            return {
                userId,
                isOnline,
                lastSeenAt: lastActivity ? new Date(parseInt(lastActivity, 10)).toISOString() : undefined,
            };
        });
        const results = await Promise.all(presencePromises);
        return results.filter(r => r.isOnline);
    }
    async getTenantUsersPresence(tenantId) {
        const tenantUsers = await this.prisma.tenantUser.findMany({
            where: {
                tenantId,
                isActive: true,
                status: 'active',
            },
            select: {
                userId: true,
                user: {
                    select: {
                        id: true,
                        lastSeenAt: true,
                    },
                },
            },
        });
        const presencePromises = tenantUsers.map(async (tu) => {
            const isOnline = await this.isUserOnline(tu.userId, tenantId);
            const key = `presence:${tenantId}:${tu.userId}`;
            const lastActivity = await this.redis.getClient().get(key);
            return {
                userId: tu.userId,
                isOnline,
                lastSeenAt: lastActivity
                    ? new Date(parseInt(lastActivity, 10)).toISOString()
                    : tu.user.lastSeenAt?.toISOString(),
            };
        });
        return Promise.all(presencePromises);
    }
    async setUserOffline(clerkUserId, tenantId) {
        const user = await this.prisma.user.findUnique({
            where: { clerkUserId },
            select: { id: true },
        });
        if (!user) {
            this.logger.warn(`User with clerkUserId ${clerkUserId} not found`);
            return;
        }
        const userId = user.id;
        const key = `presence:${tenantId}:${userId}`;
        await this.redis.getClient().del(key);
        await this.redis.getClient().srem(`presence:tenant:${tenantId}`, userId);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isOnline: false,
                lastSeenAt: new Date(),
            },
        });
        this.logger.log(`User ${userId} is now offline in tenant ${tenantId}`);
    }
    async getUserIdFromClerkUserId(clerkUserId) {
        const user = await this.prisma.user.findUnique({
            where: { clerkUserId },
            select: { id: true },
        });
        return user?.id || null;
    }
};
exports.PresenceService = PresenceService;
exports.PresenceService = PresenceService = PresenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_1.RedisService,
        prisma_1.PrismaService])
], PresenceService);
//# sourceMappingURL=presence.service.js.map