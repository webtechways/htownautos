"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stripe_service_1 = require("./stripe.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const create_payment_link_dto_1 = require("./dto/create-payment-link.dto");
const common_2 = require("@htownautos/common");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
const prisma_1 = require("@htownautos/prisma");
const receipt_pdf_service_1 = require("../portal/receipt-pdf.service");
const decision_note_dto_1 = require("./dto/decision-note.dto");
let StripeController = class StripeController {
    stripeService;
    prisma;
    receiptPdfService;
    constructor(stripeService, prisma, receiptPdfService) {
        this.stripeService = stripeService;
        this.prisma = prisma;
        this.receiptPdfService = receiptPdfService;
    }
    async createSetupIntent(tenantId, buyerId) {
        return this.stripeService.createSetupIntent(buyerId, tenantId);
    }
    async listPaymentMethods(tenantId, buyerId) {
        return this.stripeService.listPaymentMethods(buyerId, tenantId);
    }
    async detachPaymentMethod(tenantId, buyerId, pmId) {
        return this.stripeService.detachPaymentMethod(buyerId, pmId, tenantId);
    }
    async setDefaultPaymentMethod(tenantId, buyerId, pmId) {
        return this.stripeService.setDefaultPaymentMethod(buyerId, pmId, tenantId);
    }
    async createPayment(tenantId, buyerId, dto) {
        return this.stripeService.createPayment(buyerId, tenantId, dto.amount, dto.description, dto.paymentMethodId);
    }
    async listPayments(tenantId, buyerId, limit, startingAfter) {
        return this.stripeService.listPayments(buyerId, tenantId, limit || 20, startingAfter);
    }
    async refundPayment(tenantId, buyerId, piId) {
        return this.stripeService.refundPayment(buyerId, piId, tenantId);
    }
    async cancelRefund(tenantId, buyerId, refundId) {
        return this.stripeService.cancelRefund(buyerId, refundId, tenantId);
    }
    async createPaymentLink(tenantId, buyerId, dto, user) {
        const tenantUser = user.tenants?.find((t) => t.tenantId === tenantId || t.tenant?.id === tenantId);
        if (!tenantUser) {
            throw new common_1.BadRequestException('User is not a member of this tenant');
        }
        return this.stripeService.createPaymentLink(buyerId, tenantId, dto.amount, dto.description, dto.note, dto.deliveryMethod, tenantUser.id);
    }
    async getPaymentSummary(tenantId, buyerId) {
        return this.stripeService.getPaymentSummary(buyerId, tenantId);
    }
    async getOrderReceiptPdf(tenantId, buyerId, orderId, res) {
        const buyer = await this.prisma.buyer.findFirst({
            where: { id: buyerId, tenantId },
            select: { id: true, firstName: true, lastName: true, email: true, phoneMain: true },
        });
        if (!buyer)
            throw new common_1.BadRequestException('Buyer not found');
        const order = await this.prisma.portalOrder.findFirst({
            where: { id: orderId, buyerId, tenantId },
        });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        const receiptNumber = order.id.slice(0, 8).toUpperCase();
        const bytes = await this.receiptPdfService.buildOrderReceiptPdf(order, {
            buyerName: `${buyer.firstName} ${buyer.lastName}`.trim(),
            buyerEmail: buyer.email ?? '',
            buyerPhone: buyer.phoneMain ?? undefined,
        });
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="recibo-${receiptNumber}.pdf"`,
        });
        res.end(Buffer.from(bytes));
    }
    async listDepositReleaseRequests(tenantId, buyerId) {
        return this.stripeService.listDepositReleaseRequests(buyerId, tenantId);
    }
    async approveDepositRelease(tenantId, user, buyerId, id, dto) {
        return this.stripeService.approveDepositRelease(buyerId, tenantId, id, user.id, dto.note);
    }
    async rejectDepositRelease(tenantId, user, buyerId, id, dto) {
        return this.stripeService.rejectDepositRelease(buyerId, tenantId, id, user.id, dto.note);
    }
};
exports.StripeController = StripeController;
__decorate([
    (0, common_1.Post)('customers/:buyerId/setup-intent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a SetupIntent for adding a payment method' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, common_2.AuditLog)({
        action: 'create',
        resource: 'stripe-setup-intent',
        level: 'high',
        pii: true,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "createSetupIntent", null);
__decorate([
    (0, common_1.Get)('customers/:buyerId/payment-methods'),
    (0, swagger_1.ApiOperation)({ summary: 'List payment methods for a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'stripe-payment-methods',
        level: 'medium',
        pii: true,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "listPaymentMethods", null);
__decorate([
    (0, common_1.Delete)('customers/:buyerId/payment-methods/:pmId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a payment method' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'pmId', description: 'Stripe payment method ID' }),
    (0, common_2.AuditLog)({
        action: 'delete',
        resource: 'stripe-payment-method',
        level: 'high',
        pii: true,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('pmId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "detachPaymentMethod", null);
__decorate([
    (0, common_1.Post)('customers/:buyerId/payment-methods/:pmId/default'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set a payment method as default' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'pmId', description: 'Stripe payment method ID' }),
    (0, common_2.AuditLog)({
        action: 'update',
        resource: 'stripe-payment-method',
        level: 'high',
        pii: true,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('pmId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "setDefaultPaymentMethod", null);
__decorate([
    (0, common_1.Post)('customers/:buyerId/payments'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a payment for a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, common_2.AuditLog)({
        action: 'create',
        resource: 'stripe-payment',
        level: 'critical',
        pii: true,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('customers/:buyerId/payments'),
    (0, swagger_1.ApiOperation)({ summary: 'List payments for a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'starting_after', required: false, type: String }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'stripe-payments',
        level: 'medium',
        pii: true,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('starting_after')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "listPayments", null);
__decorate([
    (0, common_1.Post)('customers/:buyerId/payments/:piId/refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Refund a payment' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'piId', description: 'Stripe PaymentIntent ID' }),
    (0, common_2.AuditLog)({
        action: 'create',
        resource: 'stripe-refund',
        level: 'critical',
        pii: true,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('piId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "refundPayment", null);
__decorate([
    (0, common_1.Post)('customers/:buyerId/refunds/:refundId/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a pending refund' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'refundId', description: 'Stripe Refund ID' }),
    (0, common_2.AuditLog)({
        action: 'update',
        resource: 'stripe-refund',
        level: 'critical',
        pii: true,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('refundId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "cancelRefund", null);
__decorate([
    (0, common_1.Post)('customers/:buyerId/payment-link'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create and send a Stripe payment link via SMS or email' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, common_2.AuditLog)({
        action: 'create',
        resource: 'stripe-payment-link',
        level: 'critical',
        pii: true,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_2.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_payment_link_dto_1.CreatePaymentLinkDto, Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "createPaymentLink", null);
__decorate([
    (0, common_1.Get)('customers/:buyerId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment summary for a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'stripe-summary',
        level: 'medium',
        pii: false,
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "getPaymentSummary", null);
__decorate([
    (0, common_1.Get)('customers/:buyerId/orders/:orderId/receipt.pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Download PDF receipt for a buyer order' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', description: 'PortalOrder UUID' }),
    (0, common_2.AuditLog)({ action: 'read', resource: 'portal-order-receipt-pdf', level: 'medium', pii: true }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "getOrderReceiptPdf", null);
__decorate([
    (0, common_1.Get)('customers/:buyerId/deposit-release-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'List deposit release requests for a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, common_2.AuditLog)({ action: 'read', resource: 'deposit-release-requests', level: 'medium', pii: false }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "listDepositReleaseRequests", null);
__decorate([
    (0, common_1.Post)('customers/:buyerId/deposit-release-requests/:id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a deposit release request' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'DepositReleaseRequest UUID' }),
    (0, common_2.AuditLog)({ action: 'update', resource: 'deposit-release-request', level: 'critical', pii: true }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_2.CurrentUser)()),
    __param(2, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Param)('id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, decision_note_dto_1.DecisionNoteDto]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "approveDepositRelease", null);
__decorate([
    (0, common_1.Post)('customers/:buyerId/deposit-release-requests/:id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a deposit release request' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'DepositReleaseRequest UUID' }),
    (0, common_2.AuditLog)({ action: 'update', resource: 'deposit-release-request', level: 'high', pii: false }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_2.CurrentUser)()),
    __param(2, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Param)('id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, decision_note_dto_1.DecisionNoteDto]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "rejectDepositRelease", null);
exports.StripeController = StripeController = __decorate([
    (0, swagger_1.ApiTags)('Stripe'),
    (0, common_1.Controller)('stripe'),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => receipt_pdf_service_1.ReceiptPdfService))),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        prisma_1.PrismaService,
        receipt_pdf_service_1.ReceiptPdfService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map