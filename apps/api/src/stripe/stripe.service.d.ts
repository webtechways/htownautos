import Stripe from 'stripe';
import { PrismaService } from '@htownautos/prisma';
import { StripeEventsService } from '../presence/stripe-events.service';
import { SmsService } from '../sms/sms.service';
import { EmailService } from '../email/email.service';
import { ShortUrlService } from '../short-url/short-url.service';
import { PortalService } from '../portal/portal.service';
import type { OrderReceiptDetail } from '../portal/portal.service';
export declare class StripeService {
    private readonly prisma;
    private readonly stripeEvents;
    private readonly smsService;
    private readonly emailService;
    private readonly shortUrlService;
    private readonly portalService?;
    private readonly stripe;
    private readonly logger;
    constructor(prisma: PrismaService, stripeEvents: StripeEventsService, smsService: SmsService, emailService: EmailService, shortUrlService: ShortUrlService, portalService?: PortalService | undefined);
    private getBuyer;
    getOrCreateStripeCustomer(buyerId: string, tenantId: string): Promise<string>;
    createSetupIntent(buyerId: string, tenantId: string): Promise<{
        clientSecret: string | null;
        setupIntentId: string;
    }>;
    listPaymentMethods(buyerId: string, tenantId: string): Promise<{
        paymentMethods: {
            id: string;
            brand: string | undefined;
            last4: string | undefined;
            expMonth: number | undefined;
            expYear: number | undefined;
            isDefault: boolean;
            created: number;
        }[];
        defaultPaymentMethodId: string | Stripe.PaymentMethod | null;
    }>;
    detachPaymentMethod(buyerId: string, paymentMethodId: string, tenantId: string): Promise<{
        message: string;
    }>;
    setDefaultPaymentMethod(buyerId: string, paymentMethodId: string, tenantId: string): Promise<{
        message: string;
    }>;
    createPayment(buyerId: string, tenantId: string, amountInCents: number, description: string, paymentMethodId?: string): Promise<{
        id: string;
        status: Stripe.PaymentIntent.Status;
        amount: number;
        clientSecret: string | null;
    }>;
    listPayments(buyerId: string, tenantId: string, limit?: number, startingAfter?: string): Promise<{
        payments: never[];
        hasMore: boolean;
        events?: undefined;
        nextCursor?: undefined;
    } | {
        events: {
            id: string;
            type: "payment" | "refund";
            amount: number;
            currency: string;
            status: string;
            description: string | null;
            created: number;
            paymentMethod: {
                brand: string;
                last4: string;
            } | null;
            refunded: boolean;
            refundStatus: string | null;
            refundId: string | null;
            amountRefunded: number;
            relatedPaymentId: string | null;
            orderType: string | null;
            orderId: string | null;
            order: OrderReceiptDetail | null;
        }[];
        hasMore: boolean;
        nextCursor: string | null;
        payments?: undefined;
    }>;
    refundPayment(buyerId: string, paymentIntentId: string, tenantId: string): Promise<{
        id: string;
        amount: number;
        status: string | null;
        paymentIntentId: string;
    }>;
    cancelRefund(buyerId: string, refundId: string, tenantId: string): Promise<{
        id: string;
        status: string | null;
    }>;
    private computeBuyerDeposits;
    getPaymentSummary(buyerId: string, tenantId: string): Promise<{
        depositTotalCents: number;
        depositBalanceCents: number;
        totalPaid: number;
        paymentCount: number;
        lastPaymentDate: number | null;
        lastPaymentAmount: number | null;
        defaultPaymentMethod: {
            brand: string;
            last4: string;
        } | null;
        hasPaymentMethods: boolean;
    }>;
    createPaymentLink(buyerId: string, tenantId: string, amountInCents: number, description: string, note: string | undefined, deliveryMethod: 'sms' | 'email' | 'link', senderId: string): Promise<{
        url: string;
        sessionId: string;
    }>;
    private getPaymentLinkHtml;
    listDepositReleaseRequests(buyerId: string, tenantId: string): Promise<{
        amount: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        note: string | null;
        tenantId: string | null;
        buyerId: string;
        status: import("@prisma/client").$Enums.DepositReleaseStatus;
        currency: string;
        decisionNote: string | null;
        stripeRefundId: string | null;
        decidedById: string | null;
        decidedAt: Date | null;
    }[]>;
    approveDepositRelease(buyerId: string, tenantId: string, id: string, staffUserId: string | null, note?: string): Promise<{
        amount: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        note: string | null;
        tenantId: string | null;
        buyerId: string;
        status: import("@prisma/client").$Enums.DepositReleaseStatus;
        currency: string;
        decisionNote: string | null;
        stripeRefundId: string | null;
        decidedById: string | null;
        decidedAt: Date | null;
    }>;
    rejectDepositRelease(buyerId: string, tenantId: string, id: string, staffUserId: string | null, note?: string): Promise<{
        amount: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        note: string | null;
        tenantId: string | null;
        buyerId: string;
        status: import("@prisma/client").$Enums.DepositReleaseStatus;
        currency: string;
        decisionNote: string | null;
        stripeRefundId: string | null;
        decidedById: string | null;
        decidedAt: Date | null;
    }>;
    constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event;
    handleWebhookEvent(event: Stripe.Event): Promise<void>;
    private emitStripeEvent;
}
