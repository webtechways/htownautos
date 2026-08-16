import type { AuthenticatedUser } from '@htownautos/auth';
import { NotificationsService } from './notifications.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(user: AuthenticatedUser, tenantId: string, query: ListNotificationsDto): Promise<{
        items: {
            id: string;
            title: string;
            createdAt: Date;
            tenantId: string;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
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
    unreadCount(user: AuthenticatedUser, tenantId: string): Promise<{
        count: number;
    }>;
    markRead(id: string, user: AuthenticatedUser): Promise<{
        ok: boolean;
    }>;
    markAllRead(user: AuthenticatedUser, tenantId: string): Promise<{
        ok: boolean;
        updated: number;
    }>;
}
