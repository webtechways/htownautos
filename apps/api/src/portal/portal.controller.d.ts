import type { Response } from 'express';
import type { PortalBuyer } from '@htownautos/auth';
import { PortalService } from './portal.service';
import { StripeService } from '../stripe/stripe.service';
import { BuyerFavoritesService } from '../buyer-favorites/buyer-favorites.service';
import { ReceiptPdfService } from './receipt-pdf.service';
import { ToggleBuyerFavoriteDto } from '../buyer-favorites/dto/toggle-buyer-favorite.dto';
import { UpdatePortalProfileDto } from './dto/update-portal-profile.dto';
import { InspectionCartDto } from './dto/inspection-cart.dto';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { AddInspectionRequestDto } from './dto/add-inspection-request.dto';
import { CreateDepositReleaseRequestDto } from './dto/create-deposit-release-request.dto';
import { FindACarCheckoutDto } from './dto/find-a-car-checkout.dto';
import { CancelInspectionDto } from './dto/cancel-inspection.dto';
export declare class PortalController {
    private readonly portalService;
    private readonly favoritesService;
    private readonly receiptPdfService;
    private readonly stripeService;
    constructor(portalService: PortalService, favoritesService: BuyerFavoritesService, receiptPdfService: ReceiptPdfService, stripeService: StripeService);
    getMe(buyer: PortalBuyer): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phoneMain: string;
        phoneSecondary: string | null;
        phoneMobile: string | null;
        currentAddress: string;
        currentCity: string;
        currentState: string;
        currentZipCode: string;
        currentCountry: string;
    }>;
    updateMe(buyer: PortalBuyer, dto: UpdatePortalProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phoneMain: string;
        phoneSecondary: string | null;
        phoneMobile: string | null;
        currentAddress: string;
        currentCity: string;
        currentState: string;
        currentZipCode: string;
        currentCountry: string;
    }>;
    getInspections(buyer: PortalBuyer): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getInspection(id: string, buyer: PortalBuyer): Promise<any>;
    addInspectionRequest(id: string, buyer: PortalBuyer, dto: AddInspectionRequestDto): Promise<{
        media: {
            path: string | null;
            url: string;
            id: string;
            title: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            description: string | null;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            buyerId: string | null;
            vehicleId: string | null;
            partId: string | null;
            duration: number | null;
            filename: string;
            mimeType: string;
            size: number;
            width: number | null;
            height: number | null;
            alt: string | null;
            mediaType: string;
            category: string | null;
            storageProvider: string | null;
            storageBucket: string | null;
            storageKey: string | null;
            isPublic: boolean;
            inspectionId: string | null;
            inspectionChecklistItemId: string | null;
            inspectionRequestItemId: string | null;
            inspectionErrorCodeId: string | null;
            carfaxReportId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        note: string;
        inspectionId: string;
        sortOrder: number;
    }>;
    cancelInspection(id: string, buyer: PortalBuyer, dto: CancelInspectionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        vin: string;
        notes: string | null;
        buyerId: string | null;
        vehicleId: string | null;
        completedAt: Date | null;
        status: import("@prisma/client").$Enums.VehicleInspectionStatus;
        lotNumber: string | null;
        yardName: string | null;
        yardNumber: string | null;
        yardId: string | null;
        requestedAt: Date;
        dueAt: Date | null;
        inspectedAt: Date | null;
        inspectorId: string | null;
        specificRequest: string | null;
        overallRating: number | null;
        marketPrice: import("@prisma/client-runtime-utils").Decimal | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
        cancelledByCustomer: boolean;
        createdBy: string | null;
    }>;
    checkoutInspections(buyer: PortalBuyer, dto: InspectionCartDto): Promise<{
        orderId: string;
        url: string | null;
        checkoutUrl: string | null;
        totalCents: number;
        currency: "usd";
        breakdown: import("./portal.service").InspectionQuote;
    }>;
    getFavorites(buyer: PortalBuyer): Promise<{
        id: string;
        lotNumber: string;
        createdAt: Date;
        listing: {
            lotNumber: string;
            inspectable: boolean;
        } | null;
    }[]>;
    getFavoriteIds(buyer: PortalBuyer): Promise<{
        ids: string[];
    }>;
    addFavorite(buyer: PortalBuyer, dto: ToggleBuyerFavoriteDto): Promise<{
        id: string;
        lotNumber: string;
        added: boolean;
    }>;
    removeFavorite(buyer: PortalBuyer, lotNumber: string): Promise<{
        lotNumber: string;
        removed: boolean;
    }>;
    getOrderBySession(buyer: PortalBuyer, sessionId: string): Promise<{
        orderId: string;
        receiptNumber: string;
        type: import("@prisma/client").$Enums.PortalOrderType;
        status: import("@prisma/client").$Enums.PortalOrderStatus;
        amountCents: number;
        currency: string;
        description: string | null;
        items: any;
        breakdown: import("./portal.service").OrderReceiptDetail | null;
        createdAt: Date;
    }>;
    getLedger(buyer: PortalBuyer): Promise<{
        entries: {
            amount: string;
            id: string;
            createdAt: Date;
            description: string | null;
            status: import("@prisma/client").$Enums.CustomerLedgerEntryStatus;
            source: string | null;
            type: import("@prisma/client").$Enums.CustomerLedgerEntryType;
            stripePaymentIntentId: string | null;
            currency: string;
            relatedInspectionId: string | null;
        }[];
        balanceCents: number;
        balanceFormatted: string;
    }>;
    createDeposit(buyer: PortalBuyer, dto: CreateDepositDto): Promise<{
        orderId: string;
        url: string | null;
        checkoutUrl: string | null;
        amountCents: number;
    }>;
    checkoutFindACar(buyer: PortalBuyer, dto: FindACarCheckoutDto): Promise<{
        orderId: string;
        url: string | null;
        checkoutUrl: string | null;
    }>;
    getPaymentSummary(buyer: PortalBuyer): Promise<{
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
    listPaymentMethods(buyer: PortalBuyer): Promise<{
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
    listPayments(buyer: PortalBuyer, startingAfter?: string): Promise<{
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
            order: import("./portal.service").OrderReceiptDetail | null;
        }[];
        hasMore: boolean;
        nextCursor: string | null;
        payments?: undefined;
    }>;
    createSetupIntent(buyer: PortalBuyer): Promise<{
        clientSecret: string | null;
        setupIntentId: string;
    }>;
    detachPaymentMethod(buyer: PortalBuyer, id: string): Promise<{
        message: string;
    }>;
    setDefaultPaymentMethod(buyer: PortalBuyer, id: string): Promise<{
        message: string;
    }>;
    getOrderReceiptPdf(buyer: PortalBuyer, orderId: string, res: Response): Promise<void>;
    createDepositReleaseRequest(buyer: PortalBuyer, dto: CreateDepositReleaseRequestDto): Promise<{
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
    getLatestDepositReleaseRequest(buyer: PortalBuyer): Promise<{
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
    } | null>;
}
