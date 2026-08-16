import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import { PhoneCallEventsService } from './phone-call-events.service';
import { SmsEventsService } from './sms-events.service';
import { StripeEventsService } from './stripe-events.service';
import { EmailEventsService } from './email-events.service';
interface AuthenticatedSocket extends Socket {
    clerkUserId?: string;
    dbUserId?: string;
    tenantId?: string;
}
export declare class PresenceGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly presenceService;
    private readonly phoneCallEventsService;
    private readonly smsEventsService;
    private readonly stripeEventsService;
    private readonly emailEventsService;
    server: Server;
    private readonly logger;
    private socketUserMap;
    constructor(presenceService: PresenceService, phoneCallEventsService: PhoneCallEventsService, smsEventsService: SmsEventsService, stripeEventsService: StripeEventsService, emailEventsService: EmailEventsService);
    afterInit(): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinTenant(client: AuthenticatedSocket, data: {
        tenantId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleLeaveTenant(client: AuthenticatedSocket): Promise<{
        success: boolean;
    }>;
    handleHeartbeat(client: AuthenticatedSocket): Promise<{
        success: boolean;
        timestamp?: undefined;
    } | {
        success: boolean;
        timestamp: string;
    }>;
}
export {};
