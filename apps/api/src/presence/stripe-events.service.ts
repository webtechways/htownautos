import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export interface StripePaymentEvent {
  id: string;
  tenantId: string;
  buyerId: string;
  type:
    | 'payment_succeeded'
    | 'payment_failed'
    | 'refund_created'
    | 'refund_updated'
    | 'refund_failed'
    | 'payment_method_attached'
    | 'payment_method_detached';
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  paymentIntentId?: string;
  refundId?: string;
  paymentMethod?: { brand: string; last4: string } | null;
  errorMessage?: string | null;
}

/**
 * Service for emitting Stripe payment events via WebSocket.
 * Used by StripeService to notify clients of payment changes in real-time.
 */
@Injectable()
export class StripeEventsService {
  private readonly logger = new Logger(StripeEventsService.name);
  private server: Server | null = null;

  /**
   * Set the Socket.IO server instance.
   * Called by PresenceGateway after initialization.
   */
  setServer(server: Server) {
    this.server = server;
    this.logger.log('Socket.IO server set for Stripe payment events');
  }

  /**
   * Emit a payment succeeded event to the tenant room.
   */
  emitPaymentSucceeded(event: StripePaymentEvent) {
    this.emit('stripe_payment_succeeded', event);
  }

  /**
   * Emit a payment failed event to the tenant room.
   */
  emitPaymentFailed(event: StripePaymentEvent) {
    this.emit('stripe_payment_failed', event);
  }

  /**
   * Emit a refund created event to the tenant room.
   */
  emitRefundCreated(event: StripePaymentEvent) {
    this.emit('stripe_refund_created', event);
  }

  /**
   * Emit a refund updated event to the tenant room.
   */
  emitRefundUpdated(event: StripePaymentEvent) {
    this.emit('stripe_refund_updated', event);
  }

  /**
   * Emit a refund failed event to the tenant room.
   */
  emitRefundFailed(event: StripePaymentEvent) {
    this.emit('stripe_refund_failed', event);
  }

  /**
   * Emit a payment method attached event to the tenant room.
   */
  emitPaymentMethodAttached(event: StripePaymentEvent) {
    this.emit('stripe_payment_method_attached', event);
  }

  /**
   * Emit a payment method detached event to the tenant room.
   */
  emitPaymentMethodDetached(event: StripePaymentEvent) {
    this.emit('stripe_payment_method_detached', event);
  }

  private emit(eventName: string, event: StripePaymentEvent) {
    if (!this.server) {
      this.logger.warn(
        `Cannot emit ${eventName}: Socket server not initialized`,
      );
      return;
    }

    const room = `tenant:${event.tenantId}`;
    this.server.to(room).emit(eventName, {
      ...event,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Emitted ${eventName} to ${room} for buyer ${event.buyerId}`,
    );
  }
}
