"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StripeEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeEventsService = void 0;
const common_1 = require("@nestjs/common");
let StripeEventsService = StripeEventsService_1 = class StripeEventsService {
    logger = new common_1.Logger(StripeEventsService_1.name);
    server = null;
    setServer(server) {
        this.server = server;
        this.logger.log('Socket.IO server set for Stripe payment events');
    }
    emitPaymentSucceeded(event) {
        this.emit('stripe_payment_succeeded', event);
    }
    emitPaymentFailed(event) {
        this.emit('stripe_payment_failed', event);
    }
    emitRefundCreated(event) {
        this.emit('stripe_refund_created', event);
    }
    emitRefundUpdated(event) {
        this.emit('stripe_refund_updated', event);
    }
    emitRefundFailed(event) {
        this.emit('stripe_refund_failed', event);
    }
    emitPaymentMethodAttached(event) {
        this.emit('stripe_payment_method_attached', event);
    }
    emitPaymentMethodDetached(event) {
        this.emit('stripe_payment_method_detached', event);
    }
    emit(eventName, event) {
        if (!this.server) {
            this.logger.warn(`Cannot emit ${eventName}: Socket server not initialized`);
            return;
        }
        const room = `tenant:${event.tenantId}`;
        this.server.to(room).emit(eventName, {
            ...event,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Emitted ${eventName} to ${room} for buyer ${event.buyerId}`);
    }
};
exports.StripeEventsService = StripeEventsService;
exports.StripeEventsService = StripeEventsService = StripeEventsService_1 = __decorate([
    (0, common_1.Injectable)()
], StripeEventsService);
//# sourceMappingURL=stripe-events.service.js.map