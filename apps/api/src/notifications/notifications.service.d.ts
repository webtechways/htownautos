import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsDto } from './dto/list-notifications.dto';
export declare class NotificationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(tenantId: string, userId: string, data: CreateNotificationDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        tenantId: string;
        metaValue: Prisma.JsonValue | null;
        entityType: string | null;
        entityId: string | null;
        priority: string;
        userId: string;
        message: string;
        type: string;
        actionUrl: string | null;
        isRead: boolean;
        readAt: Date | null;
        sentViaEmail: boolean;
        sentViaPush: boolean;
        sentViaSms: boolean;
    }>;
    notifyTenantStaff(tenantId: string, data: CreateNotificationDto): Promise<void>;
    list(userId: string, tenantId: string, query: ListNotificationsDto): Promise<{
        items: {
            id: string;
            title: string;
            createdAt: Date;
            tenantId: string;
            metaValue: Prisma.JsonValue | null;
            entityType: string | null;
            entityId: string | null;
            priority: string;
            userId: string;
            message: string;
            type: string;
            actionUrl: string | null;
            isRead: boolean;
            readAt: Date | null;
            sentViaEmail: boolean;
            sentViaPush: boolean;
            sentViaSms: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    unreadCount(userId: string, tenantId: string): Promise<number>;
    markRead(id: string, userId: string): Promise<{
        ok: boolean;
    }>;
    markAllRead(userId: string, tenantId: string): Promise<{
        ok: boolean;
        updated: number;
    }>;
}
