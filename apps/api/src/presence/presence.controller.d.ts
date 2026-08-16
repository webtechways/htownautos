import { PresenceService, UserPresence } from './presence.service';
export declare class PresenceController {
    private readonly presenceService;
    constructor(presenceService: PresenceService);
    getTenantUsersPresence(tenantId: string): Promise<{
        users: UserPresence[];
    }>;
    getOnlineUsers(tenantId: string): Promise<{
        users: UserPresence[];
    }>;
    isUserOnline(tenantId: string, userId: string): Promise<{
        userId: string;
        isOnline: boolean;
    }>;
}
