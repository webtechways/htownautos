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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const prisma_1 = require("@htownautos/prisma");
const stripe_events_service_1 = require("../presence/stripe-events.service");
const sms_service_1 = require("../sms/sms.service");
const email_service_1 = require("../email/email.service");
const short_url_service_1 = require("../short-url/short-url.service");
const portal_service_1 = require("../portal/portal.service");
let StripeService = StripeService_1 = class StripeService {
    prisma;
    stripeEvents;
    smsService;
    emailService;
    shortUrlService;
    portalService;
    stripe;
    logger = new common_1.Logger(StripeService_1.name);
    constructor(prisma, stripeEvents, smsService, emailService, shortUrlService, portalService) {
        this.prisma = prisma;
        this.stripeEvents = stripeEvents;
        this.smsService = smsService;
        this.emailService = emailService;
        this.shortUrlService = shortUrlService;
        this.portalService = portalService;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    }
    async getBuyer(buyerId, tenantId) {
        const buyer = await this.prisma.buyer.findFirst({
            where: { id: buyerId, tenantId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneMain: true,
                stripeCustomerId: true,
                tenantId: true,
            },
        });
        if (!buyer) {
            throw new common_1.NotFoundException(`Buyer ${buyerId} not found`);
        }
        return buyer;
    }
    async getOrCreateStripeCustomer(buyerId, tenantId) {
        const buyer = await this.getBuyer(buyerId, tenantId);
        if (buyer.stripeCustomerId) {
            return buyer.stripeCustomerId;
        }
        const customer = await this.stripe.customers.create({
            email: buyer.email || undefined,
            name: `${buyer.firstName} ${buyer.lastName}`.trim(),
            phone: buyer.phoneMain || undefined,
            metadata: {
                buyerId: buyer.id,
                tenantId,
            },
        });
        await this.prisma.buyer.update({
            where: { id: buyerId },
            data: { stripeCustomerId: customer.id },
        });
        this.logger.log(`Created Stripe customer ${customer.id} for buyer ${buyerId}`);
        return customer.id;
    }
    async createSetupIntent(buyerId, tenantId) {
        const stripeCustomerId = await this.getOrCreateStripeCustomer(buyerId, tenantId);
        const setupIntent = await this.stripe.setupIntents.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            metadata: {
                buyerId,
                tenantId,
            },
        });
        return {
            clientSecret: setupIntent.client_secret,
            setupIntentId: setupIntent.id,
        };
    }
    async listPaymentMethods(buyerId, tenantId) {
        const buyer = await this.getBuyer(buyerId, tenantId);
        if (!buyer.stripeCustomerId) {
            return { paymentMethods: [], defaultPaymentMethodId: null };
        }
        const [paymentMethods, customer] = await Promise.all([
            this.stripe.paymentMethods.list({
                customer: buyer.stripeCustomerId,
                type: 'card',
            }),
            this.stripe.customers.retrieve(buyer.stripeCustomerId),
        ]);
        const defaultPmId = customer.invoice_settings
            ?.default_payment_method;
        return {
            paymentMethods: paymentMethods.data.map((pm) => ({
                id: pm.id,
                brand: pm.card?.brand,
                last4: pm.card?.last4,
                expMonth: pm.card?.exp_month,
                expYear: pm.card?.exp_year,
                isDefault: pm.id === defaultPmId,
                created: pm.created,
            })),
            defaultPaymentMethodId: defaultPmId || null,
        };
    }
    async detachPaymentMethod(buyerId, paymentMethodId, tenantId) {
        const buyer = await this.getBuyer(buyerId, tenantId);
        if (!buyer.stripeCustomerId) {
            throw new common_1.BadRequestException('Buyer has no Stripe customer');
        }
        const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
        if (pm.customer !== buyer.stripeCustomerId) {
            throw new common_1.BadRequestException('Payment method does not belong to this customer');
        }
        await this.stripe.paymentMethods.detach(paymentMethodId);
        return { message: 'Payment method removed' };
    }
    async setDefaultPaymentMethod(buyerId, paymentMethodId, tenantId) {
        const buyer = await this.getBuyer(buyerId, tenantId);
        if (!buyer.stripeCustomerId) {
            throw new common_1.BadRequestException('Buyer has no Stripe customer');
        }
        const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
        if (pm.customer !== buyer.stripeCustomerId) {
            throw new common_1.BadRequestException('Payment method does not belong to this customer');
        }
        await this.stripe.customers.update(buyer.stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        return { message: 'Default payment method updated' };
    }
    async createPayment(buyerId, tenantId, amountInCents, description, paymentMethodId) {
        const stripeCustomerId = await this.getOrCreateStripeCustomer(buyerId, tenantId);
        const params = {
            amount: amountInCents,
            currency: 'usd',
            customer: stripeCustomerId,
            description,
            metadata: {
                buyerId,
                tenantId,
            },
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
        };
        if (paymentMethodId) {
            params.payment_method = paymentMethodId;
            params.confirm = true;
        }
        const paymentIntent = await this.stripe.paymentIntents.create(params);
        return {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            clientSecret: paymentIntent.client_secret,
        };
    }
    async listPayments(buyerId, tenantId, limit = 20, startingAfter) {
        const buyer = await this.getBuyer(buyerId, tenantId);
        if (!buyer.stripeCustomerId) {
            return { payments: [], hasMore: false };
        }
        const params = {
            customer: buyer.stripeCustomerId,
            limit,
        };
        if (startingAfter) {
            params.starting_after = startingAfter;
        }
        const paymentIntents = await this.stripe.paymentIntents.list({
            ...params,
            expand: ['data.latest_charge'],
        });
        const events = [];
        for (const pi of paymentIntents.data) {
            const charge = pi.latest_charge;
            const cardDetails = charge?.payment_method_details?.card;
            const paymentMethod = cardDetails
                ? {
                    brand: cardDetails.brand || 'unknown',
                    last4: cardDetails.last4 || '****',
                }
                : null;
            const latestRefund = charge?.refunds?.data?.[0] ?? null;
            events.push({
                id: pi.id,
                type: 'payment',
                amount: pi.amount,
                currency: pi.currency,
                status: pi.status,
                description: pi.description,
                created: pi.created,
                paymentMethod,
                refunded: charge?.refunded ?? false,
                refundStatus: latestRefund?.status ?? null,
                refundId: latestRefund?.id ?? null,
                amountRefunded: charge?.amount_refunded ?? 0,
                relatedPaymentId: null,
                orderType: null,
                orderId: null,
                order: null,
            });
            if (charge?.refunds?.data) {
                for (const refund of charge.refunds.data) {
                    events.push({
                        id: refund.id,
                        type: 'refund',
                        amount: refund.amount,
                        currency: refund.currency,
                        status: refund.status ?? 'unknown',
                        description: pi.description
                            ? `Refund – ${pi.description}`
                            : 'Refund',
                        created: refund.created,
                        paymentMethod,
                        refunded: false,
                        refundStatus: null,
                        refundId: null,
                        amountRefunded: 0,
                        relatedPaymentId: pi.id,
                        orderType: null,
                        orderId: null,
                        order: null,
                    });
                }
            }
        }
        try {
            const piIds = events.filter((e) => e.type === 'payment').map((e) => e.id);
            const piToOrderId = new Map();
            for (const pi of paymentIntents.data) {
                const oid = pi.metadata?.portalOrderId;
                if (oid)
                    piToOrderId.set(pi.id, oid);
            }
            const orderIds = Array.from(new Set(piToOrderId.values()));
            if ((piIds.length > 0 || orderIds.length > 0) && this.portalService) {
                const orders = await this.prisma.portalOrder.findMany({
                    where: {
                        buyerId,
                        OR: [
                            { stripePaymentIntentId: { in: piIds } },
                            ...(orderIds.length > 0 ? [{ id: { in: orderIds } }] : []),
                        ],
                    },
                });
                const orderByPi = new Map(orders
                    .filter((o) => o.stripePaymentIntentId)
                    .map((o) => [o.stripePaymentIntentId, o]));
                const orderById = new Map(orders.map((o) => [o.id, o]));
                await Promise.all(events
                    .filter((e) => e.type === 'payment')
                    .map(async (e) => {
                    const order = orderByPi.get(e.id) ??
                        orderById.get(piToOrderId.get(e.id) ?? '');
                    if (!order)
                        return;
                    e.orderType = order.type;
                    e.orderId = order.id;
                    e.order =
                        (await this.portalService.buildOrderReceiptDetail(order)) ??
                            null;
                }));
            }
        }
        catch (err) {
            this.logger.warn(`listPayments: order enrichment failed for buyer ${buyerId} — ${err.message}`);
        }
        events.sort((a, b) => b.created - a.created);
        return {
            events,
            hasMore: paymentIntents.has_more,
            nextCursor: paymentIntents.data.length > 0
                ? paymentIntents.data[paymentIntents.data.length - 1].id
                : null,
        };
    }
    async refundPayment(buyerId, paymentIntentId, tenantId) {
        const buyer = await this.getBuyer(buyerId, tenantId);
        if (!buyer.stripeCustomerId) {
            throw new common_1.BadRequestException('Buyer has no Stripe customer');
        }
        const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        if (pi.customer !== buyer.stripeCustomerId) {
            throw new common_1.BadRequestException('Payment does not belong to this customer');
        }
        if (pi.status !== 'succeeded') {
            throw new common_1.BadRequestException('Only succeeded payments can be refunded');
        }
        const refund = await this.stripe.refunds.create({
            payment_intent: paymentIntentId,
        });
        this.logger.log(`Refund ${refund.id} created for PaymentIntent ${paymentIntentId} — $${(refund.amount / 100).toFixed(2)}`);
        return {
            id: refund.id,
            amount: refund.amount,
            status: refund.status,
            paymentIntentId,
        };
    }
    async cancelRefund(buyerId, refundId, tenantId) {
        const buyer = await this.getBuyer(buyerId, tenantId);
        if (!buyer.stripeCustomerId) {
            throw new common_1.BadRequestException('Buyer has no Stripe customer');
        }
        const refund = await this.stripe.refunds.retrieve(refundId);
        if (refund.payment_intent) {
            const piId = typeof refund.payment_intent === 'string'
                ? refund.payment_intent
                : refund.payment_intent.id;
            const pi = await this.stripe.paymentIntents.retrieve(piId);
            if (pi.customer !== buyer.stripeCustomerId) {
                throw new common_1.BadRequestException('Refund does not belong to this customer');
            }
        }
        if (refund.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending refunds can be canceled');
        }
        const canceled = await this.stripe.refunds.cancel(refundId);
        this.logger.log(`Refund ${refundId} canceled`);
        return {
            id: canceled.id,
            status: canceled.status,
        };
    }
    async computeBuyerDeposits(buyerId) {
        try {
            const entries = await this.prisma.customerLedgerEntry.findMany({
                where: { buyerId },
                select: { type: true, status: true, amount: true },
            });
            let depositTotalCents = 0;
            let depositBalanceCents = 0;
            for (const e of entries) {
                if (e.status !== 'COMPLETED')
                    continue;
                const cents = Math.round(Number(e.amount) * 100);
                if (e.type === 'DEPOSIT') {
                    depositTotalCents += cents;
                    depositBalanceCents += cents;
                }
                else if (e.type === 'REFUND' || e.type === 'ADJUSTMENT') {
                    depositBalanceCents += cents;
                }
                else if (e.type === 'CHARGE' || e.type === 'APPLIED') {
                    depositBalanceCents -= cents;
                }
            }
            return {
                depositTotalCents,
                depositBalanceCents: Math.max(0, depositBalanceCents),
            };
        }
        catch {
            return { depositTotalCents: 0, depositBalanceCents: 0 };
        }
    }
    async getPaymentSummary(buyerId, tenantId) {
        const buyer = await this.getBuyer(buyerId, tenantId);
        const deposits = await this.computeBuyerDeposits(buyerId);
        if (!buyer.stripeCustomerId) {
            return {
                totalPaid: 0,
                paymentCount: 0,
                lastPaymentDate: null,
                lastPaymentAmount: null,
                defaultPaymentMethod: null,
                hasPaymentMethods: false,
                ...deposits,
            };
        }
        const [paymentIntents, customer, paymentMethods] = await Promise.all([
            this.stripe.paymentIntents.list({
                customer: buyer.stripeCustomerId,
                limit: 100,
                expand: ['data.latest_charge'],
            }),
            this.stripe.customers.retrieve(buyer.stripeCustomerId),
            this.stripe.paymentMethods.list({
                customer: buyer.stripeCustomerId,
                type: 'card',
                limit: 1,
            }),
        ]);
        const succeeded = paymentIntents.data.filter((pi) => pi.status === 'succeeded');
        const totalPaid = succeeded.reduce((sum, pi) => {
            const charge = pi.latest_charge;
            const refunded = charge?.amount_refunded ?? 0;
            return sum + pi.amount - refunded;
        }, 0);
        const lastPayment = succeeded[0];
        const cust = customer;
        const defaultPmId = cust.invoice_settings?.default_payment_method;
        let defaultPmSummary = null;
        if (defaultPmId && typeof defaultPmId === 'string') {
            const pm = await this.stripe.paymentMethods.retrieve(defaultPmId);
            defaultPmSummary = {
                brand: pm.card?.brand || 'unknown',
                last4: pm.card?.last4 || '****',
            };
        }
        return {
            totalPaid,
            paymentCount: succeeded.length,
            lastPaymentDate: lastPayment ? lastPayment.created : null,
            lastPaymentAmount: lastPayment ? lastPayment.amount : null,
            defaultPaymentMethod: defaultPmSummary,
            hasPaymentMethods: paymentMethods.data.length > 0,
            ...deposits,
        };
    }
    async createPaymentLink(buyerId, tenantId, amountInCents, description, note, deliveryMethod, senderId) {
        const buyer = await this.getBuyer(buyerId, tenantId);
        const stripeCustomerId = await this.getOrCreateStripeCustomer(buyerId, tenantId);
        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            customer: stripeCustomerId,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: amountInCents,
                        product_data: { name: description },
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                description,
                metadata: { buyerId, tenantId },
            },
            metadata: { buyerId, tenantId },
            success_url: 'https://app.htownautos.com/payment/status?session_id={CHECKOUT_SESSION_ID}&result=success',
            cancel_url: 'https://app.htownautos.com/payment/status?session_id={CHECKOUT_SESSION_ID}&result=canceled',
        });
        const amountFormatted = `$${(amountInCents / 100).toFixed(2)}`;
        const { shortUrl } = await this.shortUrlService.create(session.url, tenantId, senderId, new Date(Date.now() + 24 * 60 * 60 * 1000));
        const linkUrl = shortUrl;
        const message = note?.trim() || description;
        if (deliveryMethod === 'sms') {
            const phone = buyer.phoneMain;
            if (!phone) {
                throw new common_1.BadRequestException('Buyer has no phone number for SMS');
            }
            const body = `${message}\n\nPayment amount: ${amountFormatted}\nPay here: ${linkUrl}`;
            await this.smsService.sendSms(tenantId, senderId, {
                buyerId,
                body,
            });
            this.logger.log(`Payment link sent via SMS to buyer ${buyerId} — ${amountFormatted}`);
        }
        else if (deliveryMethod === 'email') {
            const email = buyer.email;
            if (!email) {
                throw new common_1.BadRequestException('Buyer has no email address');
            }
            await this.emailService.sendEmail({
                to: email,
                subject: `Payment Request — ${amountFormatted}`,
                htmlBody: this.getPaymentLinkHtml(`${buyer.firstName} ${buyer.lastName}`.trim(), message, amountFormatted, description, linkUrl),
                textBody: `${message}\n\nAmount: ${amountFormatted}\nDescription: ${description}\nPay here: ${linkUrl}`,
                fromName: 'HTown Autos',
            });
            this.logger.log(`Payment link sent via email to buyer ${buyerId} — ${amountFormatted}`);
        }
        else {
            this.logger.log(`Payment link generated (copy-only) for buyer ${buyerId} — ${amountFormatted}`);
        }
        return { url: linkUrl, sessionId: session.id };
    }
    getPaymentLinkHtml(customerName, note, amount, description, linkUrl) {
        return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f4f4f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,.1);">
        <tr><td style="padding:40px 40px 20px;text-align:center;border-bottom:1px solid #e4e4e7;">
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#18181b;">HTown Autos</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;">Payment Request</h2>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#52525b;">
            Hi ${customerName},
          </p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#52525b;">${note}</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;background:#f4f4f5;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#71717a;"><strong>Amount:</strong> ${amount}</p>
              <p style="margin:0;font-size:14px;color:#71717a;"><strong>Description:</strong> ${description}</p>
            </td></tr>
          </table>
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr><td align="center" style="padding:20px 0;">
              <a href="${linkUrl}" style="display:inline-block;padding:14px 32px;background:#2563eb;color:#fff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                Pay ${amount}
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:14px;color:#a1a1aa;">If the button doesn't work, copy and paste this link:</p>
          <p style="margin:8px 0 0;font-size:12px;color:#2563eb;word-break:break-all;">${linkUrl}</p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #e4e4e7;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">&copy; ${new Date().getFullYear()} HTown Autos. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
    }
    async listDepositReleaseRequests(buyerId, tenantId) {
        await this.getBuyer(buyerId, tenantId);
        const rows = await this.prisma.depositReleaseRequest.findMany({
            where: { buyerId, tenantId },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => ({ ...r, amount: r.amount.toString() }));
    }
    async approveDepositRelease(buyerId, tenantId, id, staffUserId, note) {
        await this.getBuyer(buyerId, tenantId);
        const req = await this.prisma.depositReleaseRequest.findFirst({
            where: { id, buyerId, tenantId },
        });
        if (!req)
            throw new common_1.NotFoundException(`DepositReleaseRequest ${id} not found`);
        if (req.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Request is already ${req.status}`);
        }
        const amountDecimal = req.amount;
        const amountCents = Math.round(Number(amountDecimal) * 100);
        await this.prisma.customerLedgerEntry.create({
            data: {
                tenantId,
                buyerId,
                type: 'ADJUSTMENT',
                status: 'COMPLETED',
                amount: new client_1.Prisma.Decimal(-amountCents / 100),
                currency: req.currency,
                description: 'Liberación de depósito aprobada',
                source: 'manual',
                createdById: staffUserId ?? undefined,
            },
        });
        let stripeRefundId = null;
        try {
            const depositOrder = await this.prisma.portalOrder.findFirst({
                where: { buyerId, tenantId, type: 'DEPOSIT', stripePaymentIntentId: { not: null } },
                orderBy: { createdAt: 'desc' },
                select: { stripePaymentIntentId: true, amount: true },
            });
            if (depositOrder?.stripePaymentIntentId) {
                const piAmountCents = Math.round(Number(depositOrder.amount) * 100);
                const refundAmount = Math.min(amountCents, piAmountCents);
                const refund = await this.stripe.refunds.create({
                    payment_intent: depositOrder.stripePaymentIntentId,
                    amount: refundAmount,
                });
                stripeRefundId = refund.id;
                this.logger.log(`approveDepositRelease: Stripe refund ${refund.id} for $${(refundAmount / 100).toFixed(2)} (request ${id})`);
            }
        }
        catch (err) {
            this.logger.warn(`approveDepositRelease: Stripe refund failed for request ${id} — ${err.message}. Ledger debit already applied; approval proceeds.`);
        }
        const updated = await this.prisma.depositReleaseRequest.update({
            where: { id },
            data: {
                status: 'APPROVED',
                decidedById: staffUserId ?? undefined,
                decidedAt: new Date(),
                decisionNote: note,
                stripeRefundId,
            },
        });
        return { ...updated, amount: updated.amount.toString() };
    }
    async rejectDepositRelease(buyerId, tenantId, id, staffUserId, note) {
        await this.getBuyer(buyerId, tenantId);
        const req = await this.prisma.depositReleaseRequest.findFirst({
            where: { id, buyerId, tenantId },
        });
        if (!req)
            throw new common_1.NotFoundException(`DepositReleaseRequest ${id} not found`);
        if (req.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Request is already ${req.status}`);
        }
        const updated = await this.prisma.depositReleaseRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                decidedById: staffUserId ?? undefined,
                decidedAt: new Date(),
                decisionNote: note,
            },
        });
        return { ...updated, amount: updated.amount.toString() };
    }
    constructWebhookEvent(rawBody, signature) {
        return this.stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    }
    async handleWebhookEvent(event) {
        this.logger.log(`Processing webhook event: ${event.type} (${event.id})`);
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const pi = event.data.object;
                this.logger.log(`Payment succeeded: ${pi.id} for $${(pi.amount / 100).toFixed(2)}`);
                await this.emitStripeEvent(pi.customer, {
                    type: 'payment_succeeded',
                    amount: pi.amount,
                    currency: pi.currency,
                    status: pi.status,
                    description: pi.description,
                    paymentIntentId: pi.id,
                });
                break;
            }
            case 'payment_intent.payment_failed': {
                const pi = event.data.object;
                const errorMsg = pi.last_payment_error?.message ?? 'Unknown error';
                this.logger.warn(`Payment failed: ${pi.id} - ${errorMsg}`);
                await this.emitStripeEvent(pi.customer, {
                    type: 'payment_failed',
                    amount: pi.amount,
                    currency: pi.currency,
                    status: pi.status,
                    description: pi.description,
                    paymentIntentId: pi.id,
                    errorMessage: errorMsg,
                });
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object;
                const refund = charge.refunds?.data?.[0];
                this.logger.log(`Charge refunded: ${charge.id} — $${(charge.amount_refunded / 100).toFixed(2)}`);
                const piId = typeof charge.payment_intent === 'string'
                    ? charge.payment_intent
                    : charge.payment_intent?.id;
                await this.emitStripeEvent(charge.customer, {
                    type: 'refund_created',
                    amount: charge.amount_refunded,
                    currency: charge.currency,
                    status: refund?.status ?? 'succeeded',
                    description: null,
                    paymentIntentId: piId,
                    refundId: refund?.id,
                });
                break;
            }
            case 'charge.refund.updated': {
                const refund = event.data.object;
                this.logger.log(`Refund updated: ${refund.id} — status: ${refund.status}`);
                const piId = typeof refund.payment_intent === 'string'
                    ? refund.payment_intent
                    : refund.payment_intent?.id;
                let customerId = null;
                if (typeof refund.charge === 'string') {
                    const ch = await this.stripe.charges.retrieve(refund.charge);
                    customerId = ch.customer;
                }
                else if (refund.charge) {
                    customerId = refund.charge.customer;
                }
                if (customerId) {
                    const emitType = refund.status === 'failed' ? 'refund_failed' : 'refund_updated';
                    await this.emitStripeEvent(customerId, {
                        type: emitType,
                        amount: refund.amount,
                        currency: refund.currency,
                        status: refund.status ?? 'unknown',
                        description: null,
                        paymentIntentId: piId,
                        refundId: refund.id,
                    });
                }
                break;
            }
            case 'setup_intent.succeeded': {
                const si = event.data.object;
                this.logger.log(`Setup intent succeeded: ${si.id}, payment method: ${si.payment_method}`);
                const pmId = typeof si.payment_method === 'string'
                    ? si.payment_method
                    : si.payment_method?.id;
                let pmDetails = null;
                if (pmId) {
                    const pm = await this.stripe.paymentMethods.retrieve(pmId);
                    pmDetails = {
                        brand: pm.card?.brand || 'unknown',
                        last4: pm.card?.last4 || '****',
                    };
                }
                await this.emitStripeEvent(si.customer, {
                    type: 'payment_method_attached',
                    amount: 0,
                    currency: 'usd',
                    status: 'succeeded',
                    description: null,
                    paymentMethod: pmDetails,
                });
                break;
            }
            case 'checkout.session.completed': {
                const session = event.data.object;
                if (session.payment_status === 'paid') {
                    this.logger.log(`Checkout session completed: ${session.id} — $${((session.amount_total ?? 0) / 100).toFixed(2)}`);
                    if (session.metadata?.portalOrderId && this.portalService) {
                        await this.portalService.fulfillPortalOrder(session);
                    }
                    const piId = typeof session.payment_intent === 'string'
                        ? session.payment_intent
                        : session.payment_intent?.id;
                    await this.emitStripeEvent(session.customer, {
                        type: 'payment_succeeded',
                        amount: session.amount_total ?? 0,
                        currency: session.currency ?? 'usd',
                        status: 'succeeded',
                        description: null,
                        paymentIntentId: piId,
                    });
                }
                break;
            }
            case 'payment_method.detached': {
                const pm = event.data.object;
                this.logger.log(`Payment method detached: ${pm.id}`);
                break;
            }
            default:
                this.logger.debug(`Unhandled event type: ${event.type}`);
        }
    }
    async emitStripeEvent(stripeCustomerId, payload) {
        if (!stripeCustomerId) {
            this.logger.warn('Cannot emit Stripe event: no customer ID');
            return;
        }
        const buyer = await this.prisma.buyer.findFirst({
            where: { stripeCustomerId },
            select: { id: true, tenantId: true },
        });
        if (!buyer || !buyer.tenantId) {
            this.logger.warn(`No buyer found for Stripe customer ${stripeCustomerId}`);
            return;
        }
        const event = {
            id: `evt_${Date.now()}`,
            tenantId: buyer.tenantId,
            buyerId: buyer.id,
            ...payload,
        };
        switch (payload.type) {
            case 'payment_succeeded':
                this.stripeEvents.emitPaymentSucceeded(event);
                break;
            case 'payment_failed':
                this.stripeEvents.emitPaymentFailed(event);
                break;
            case 'refund_created':
                this.stripeEvents.emitRefundCreated(event);
                break;
            case 'refund_updated':
                this.stripeEvents.emitRefundUpdated(event);
                break;
            case 'refund_failed':
                this.stripeEvents.emitRefundFailed(event);
                break;
            case 'payment_method_attached':
                this.stripeEvents.emitPaymentMethodAttached(event);
                break;
            case 'payment_method_detached':
                this.stripeEvents.emitPaymentMethodDetached(event);
                break;
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => portal_service_1.PortalService))),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        stripe_events_service_1.StripeEventsService,
        sms_service_1.SmsService,
        email_service_1.EmailService,
        short_url_service_1.ShortUrlService,
        portal_service_1.PortalService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map