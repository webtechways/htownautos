import { PrismaService } from '@htownautos/prisma';
import { NotificationsService } from '../notifications/notifications.service';
export declare class SyncWatchdogService {
    private readonly prisma;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    checkCopartSyncStaleness(): Promise<void>;
}
