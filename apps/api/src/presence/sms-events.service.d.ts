import { Server } from 'socket.io';
export interface SmsEventUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
}
export interface SmsEventSender {
    id: string;
    user: SmsEventUser;
}
export interface SmsEventBuyer {
    id: string;
    firstName: string;
    lastName: string;
    phoneMain: string | null;
    phoneMobile: string | null;
}
export interface SmsEvent {
    id: string;
    tenantId: string;
    direction: 'inbound' | 'outbound';
    status: string;
    fromNumber: string;
    toNumber: string;
    body: string;
    messageSid?: string | null;
    errorCode?: string | null;
    errorMessage?: string | null;
    mediaUrls?: string[] | null;
    numMedia?: number;
    isRead: boolean;
    buyerId: string;
    senderId?: string | null;
    sentAt?: string | null;
    deliveredAt?: string | null;
    createdAt: string;
    sender?: SmsEventSender | null;
    buyer?: SmsEventBuyer | null;
}
export declare class SmsEventsService {
    private readonly logger;
    private server;
    setServer(server: Server): void;
    emitSmsCreated(sms: SmsEvent): void;
    emitSmsUpdated(sms: SmsEvent): void;
}
