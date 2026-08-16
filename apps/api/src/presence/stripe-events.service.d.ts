import { Server } from 'socket.io';
export interface StripePaymentEvent {
    id: string;
    tenantId: string;
    buyerId: string;
    type: 'payment_succeeded' | 'payment_failed' | 'refund_created' | 'refund_updated' | 'refund_failed' | 'payment_method_attached' | 'payment_method_detached';
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    paymentIntentId?: string;
    refundId?: string;
    paymentMethod?: {
        brand: string;
        last4: string;
    } | null;
    errorMessage?: string | null;
}
export declare class StripeEventsService {
    private readonly logger;
    private server;
    setServer(server: Server): void;
    emitPaymentSucceeded(event: StripePaymentEvent): void;
    emitPaymentFailed(event: StripePaymentEvent): void;
    emitRefundCreated(event: StripePaymentEvent): void;
    emitRefundUpdated(event: StripePaymentEvent): void;
    emitRefundFailed(event: StripePaymentEvent): void;
    emitPaymentMethodAttached(event: StripePaymentEvent): void;
    emitPaymentMethodDetached(event: StripePaymentEvent): void;
    private emit;
}
