import { RedisService } from '@htownautos/redis';
import { PrismaService } from '@htownautos/prisma';
export interface UserPresence {
    userId: string;
    isOnline: boolean;
    lastSeenAt?: string;
}
export declare class PresenceService {
    private readonly redis;
    private readonly prisma;
    private readonly logger;
    constructor(redis: RedisService, prisma: PrismaService);
    setUserOnline(clerkUserId: string, tenantId: string): Promise<void>;
    updateActivity(userId: string, tenantId: string): Promise<void>;
    isUserOnline(userId: string, tenantId: string): Promise<boolean>;
    getOnlineUsers(tenantId: string): Promise<UserPresence[]>;
    getTenantUsersPresence(tenantId: string): Promise<UserPresence[]>;
    setUserOffline(clerkUserId: string, tenantId: string): Promise<void>;
    getUserIdFromClerkUserId(clerkUserId: string): Promise<string | null>;
}
