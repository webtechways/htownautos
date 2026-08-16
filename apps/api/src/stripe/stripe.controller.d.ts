import type { Response } from 'express';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import type { AuthenticatedUser } from '@htownautos/auth';
import { PrismaService } from '@htownautos/prisma';
import { ReceiptPdfService } from '../portal/receipt-pdf.service';
import { DecisionNoteDto } from './dto/decision-note.dto';
export declare class StripeController {
    private readonly stripeService;
    private readonly prisma;
    private readonly receiptPdfService;
    constructor(stripeService: StripeService, prisma: PrismaService, receiptPdfService: ReceiptPdfService);
    createSetupIntent(tenantId: string, buyerId: string): Promise<{
        clientSecret: string | null;
        setupIntentId: string;
    }>;
    listPaymentMethods(tenantId: string, buyerId: string): Promise<{
        paymentMethods: {
            id: string;
            brand: string | undefined;
            last4: string | undefined;
            expMonth: number | undefined;
            expYear: number | undefined;
            isDefault: boolean;
            created: number;
        }[];
        defaultPaymentMethodId: string | import("stripe").Stripe.PaymentMethod | null;
    }>;
    detachPaymentMethod(tenantId: string, buyerId: string, pmId: string): Promise<{
        message: string;
    }>;
    setDefaultPaymentMethod(tenantId: string, buyerId: string, pmId: string): Promise<{
        message: string;
    }>;
    createPayment(tenantId: string, buyerId: string, dto: CreatePaymentDto): Promise<{
        id: string;
        status: import("stripe").Stripe.PaymentIntent.Status;
        amount: number;
        clientSecret: string | null;
    }>;
    listPayments(tenantId: string, buyerId: string, limit?: number, startingAfter?: string): Promise<{
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
            order: import("../portal/portal.service").OrderReceiptDetail | null;
        }[];
        hasMore: boolean;
        nextCursor: string | null;
        payments?: undefined;
    }>;
    refundPayment(tenantId: string, buyerId: string, piId: string): Promise<{
        id: string;
        amount: number;
        status: string | null;
        paymentIntentId: string;
    }>;
    cancelRefund(tenantId: string, buyerId: string, refundId: string): Promise<{
        id: string;
        status: string | null;
    }>;
    createPaymentLink(tenantId: string, buyerId: string, dto: CreatePaymentLinkDto, user: AuthenticatedUser): Promise<{
        url: string;
        sessionId: string;
    }>;
    getPaymentSummary(tenantId: string, buyerId: string): Promise<{
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
    getOrderReceiptPdf(tenantId: string, buyerId: string, orderId: string, res: Response): Promise<void>;
    listDepositReleaseRequests(tenantId: string, buyerId: string): Promise<{
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
    approveDepositRelease(tenantId: string, user: AuthenticatedUser, buyerId: string, id: string, dto: DecisionNoteDto): Promise<{
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
    rejectDepositRelease(tenantId: string, user: AuthenticatedUser, buyerId: string, id: string, dto: DecisionNoteDto): Promise<{
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
}
