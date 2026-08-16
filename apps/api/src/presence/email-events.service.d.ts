import { Server } from 'socket.io';
export interface EmailEventUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
}
export interface EmailEventSender {
    id: string;
    user: EmailEventUser;
}
export interface EmailEventBuyer {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
}
export interface EmailEvent {
    id: string;
    tenantId: string;
    direction: 'inbound' | 'outbound';
    status: string;
    fromEmail: string;
    toEmail: string;
    subject: string;
    bodyHtml?: string | null;
    bodyText?: string | null;
    messageId?: string | null;
    sesStatus?: string | null;
    bounceType?: string | null;
    isRead: boolean;
    buyerId: string;
    senderId?: string | null;
    sentAt?: string | null;
    deliveredAt?: string | null;
    bouncedAt?: string | null;
    createdAt: string;
    attachmentCount?: number;
    attachments?: Array<{
        name: string;
        mimeType: string;
        size: number;
        url?: string;
        key?: string;
    }> | null;
    sender?: EmailEventSender | null;
    buyer?: EmailEventBuyer | null;
}
export declare class EmailEventsService {
    private readonly logger;
    private server;
    setServer(server: Server): void;
    emitEmailCreated(email: EmailEvent): void;
    emitEmailUpdated(email: EmailEvent): void;
}
