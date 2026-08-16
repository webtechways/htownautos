import { SmsService } from './sms.service';
import { CreateSmsDto, UpdateSmsDto } from './dto/create-sms.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { QuerySmsDto } from './dto/query-sms.dto';
import type { AuthenticatedUser } from '@htownautos/auth';
export declare class SmsController {
    private readonly smsService;
    constructor(smsService: SmsService);
    private getTenantUserId;
    create(tenantId: string, createSmsDto: CreateSmsDto, user: AuthenticatedUser): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneMain: string;
            phoneMobile: string | null;
        };
        sender: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: import("@prisma/client/runtime/client").JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    sendSms(tenantId: string, sendSmsDto: SendSmsDto, user: AuthenticatedUser): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneMain: string;
            phoneMobile: string | null;
        };
        sender: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: import("@prisma/client/runtime/client").JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    findAll(tenantId: string, query: QuerySmsDto): Promise<{
        data: ({
            buyer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phoneMain: string;
                phoneMobile: string | null;
            };
            sender: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            buyerId: string;
            phoneNumber: string;
            status: string;
            errorMessage: string | null;
            errorCode: string | null;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            isRead: boolean;
            direction: string;
            fromNumber: string;
            toNumber: string;
            senderId: string | null;
            body: string;
            messageSid: string | null;
            mediaUrls: import("@prisma/client/runtime/client").JsonValue | null;
            numMedia: number;
            priceUnit: string | null;
            segmentCount: number;
            sentAt: Date | null;
            deliveredAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(tenantId: string, buyerId?: string, senderId?: string): Promise<{
        total: number;
        sent: number;
        delivered: number;
        failed: number;
        unread: number;
    }>;
    findByBuyer(tenantId: string, buyerId: string, query: QuerySmsDto): Promise<{
        data: ({
            buyer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phoneMain: string;
                phoneMobile: string | null;
            };
            sender: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            buyerId: string;
            phoneNumber: string;
            status: string;
            errorMessage: string | null;
            errorCode: string | null;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            isRead: boolean;
            direction: string;
            fromNumber: string;
            toNumber: string;
            senderId: string | null;
            body: string;
            messageSid: string | null;
            mediaUrls: import("@prisma/client/runtime/client").JsonValue | null;
            numMedia: number;
            priceUnit: string | null;
            segmentCount: number;
            sentAt: Date | null;
            deliveredAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getConversation(tenantId: string, buyerId: string, query: QuerySmsDto): Promise<{
        data: ({
            buyer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phoneMain: string;
                phoneMobile: string | null;
            };
            sender: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string | null;
                    lastName: string | null;
                    avatar: string | null;
                };
            } & {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                userId: string;
                status: string;
                username: string | null;
                tenantEmail: string | null;
                extension: string | null;
                permissions: import("@prisma/client/runtime/client").JsonValue | null;
                roleId: string;
                acceptedAt: Date | null;
                invitationCode: string | null;
                invitationSentAt: Date | null;
                invitedBy: string | null;
                removedAt: Date | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            buyerId: string;
            phoneNumber: string;
            status: string;
            errorMessage: string | null;
            errorCode: string | null;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            isRead: boolean;
            direction: string;
            fromNumber: string;
            toNumber: string;
            senderId: string | null;
            body: string;
            messageSid: string | null;
            mediaUrls: import("@prisma/client/runtime/client").JsonValue | null;
            numMedia: number;
            priceUnit: string | null;
            segmentCount: number;
            sentAt: Date | null;
            deliveredAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneMain: string;
            phoneMobile: string | null;
        };
        sender: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: import("@prisma/client/runtime/client").JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    update(tenantId: string, id: string, updateSmsDto: UpdateSmsDto): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneMain: string;
            phoneMobile: string | null;
        };
        sender: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: import("@prisma/client/runtime/client").JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    markAsRead(tenantId: string, id: string): Promise<{
        buyer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneMain: string;
            phoneMobile: string | null;
        };
        sender: ({
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            userId: string;
            status: string;
            username: string | null;
            tenantEmail: string | null;
            extension: string | null;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
            roleId: string;
            acceptedAt: Date | null;
            invitationCode: string | null;
            invitationSentAt: Date | null;
            invitedBy: string | null;
            removedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: import("@prisma/client/runtime/client").JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    markAllAsRead(tenantId: string, buyerId: string): Promise<{
        updated: number;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
