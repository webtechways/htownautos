import { Server } from 'socket.io';
export interface PhoneCallEventUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
}
export interface PhoneCallEventCaller {
    id: string;
    user: PhoneCallEventUser;
}
export interface PhoneCallEventBuyer {
    id: string;
    firstName: string;
    lastName: string;
    phoneMain: string | null;
}
export interface PhoneCallEventTransferUser {
    id: string;
    user: PhoneCallEventUser;
}
export interface PhoneCallEvent {
    id: string;
    tenantId: string;
    direction: 'inbound' | 'outbound';
    status: string;
    outcome?: string | null;
    fromNumber: string;
    toNumber: string;
    startedAt: string;
    answeredAt?: string | null;
    endedAt?: string | null;
    duration?: number | null;
    buyerId?: string | null;
    callerId?: string | null;
    recordingUrl?: string | null;
    transcription?: string | null;
    transcriptionStatus?: string | null;
    caller?: PhoneCallEventCaller | null;
    buyer?: PhoneCallEventBuyer | null;
    transferredAt?: string | null;
    transferReason?: string | null;
    transferredTo?: PhoneCallEventTransferUser | null;
    transferredFrom?: PhoneCallEventTransferUser | null;
}
export declare class PhoneCallEventsService {
    private readonly logger;
    private server;
    setServer(server: Server): void;
    emitCallCreated(call: PhoneCallEvent): void;
    emitCallUpdated(call: PhoneCallEvent): void;
    emitCallCompleted(call: PhoneCallEvent): void;
}
