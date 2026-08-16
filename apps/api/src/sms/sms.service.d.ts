import { PrismaService } from '@htownautos/prisma';
import { TwilioService } from '../twilio/twilio.service';
import { SmsEventsService } from '../presence/sms-events.service';
import { CreateSmsDto, UpdateSmsDto } from './dto/create-sms.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { QuerySmsDto } from './dto/query-sms.dto';
import { Prisma } from '@prisma/client';
export declare class SmsService {
    private prisma;
    private twilioService;
    private smsEventsService;
    private readonly logger;
    constructor(prisma: PrismaService, twilioService: TwilioService, smsEventsService: SmsEventsService);
    private readonly includeRelations;
    private toSmsEvent;
    sendSms(tenantId: string, senderId: string, dto: SendSmsDto): Promise<{
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: Prisma.Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: Prisma.JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    handleIncomingSms(tenantId: string, phoneNumberId: string, payload: {
        MessageSid: string;
        From: string;
        To: string;
        Body: string;
        NumMedia?: string;
        NumSegments?: string;
    }): Promise<({
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: Prisma.Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: Prisma.JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }) | null>;
    handleSmsStatusUpdate(tenantId: string, payload: {
        MessageSid: string;
        MessageStatus: string;
        ErrorCode?: string;
        ErrorMessage?: string;
    }): Promise<({
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: Prisma.Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: Prisma.JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }) | null>;
    private findBuyerByPhone;
    create(tenantId: string, createSmsDto: CreateSmsDto, senderId?: string): Promise<{
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: Prisma.Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: Prisma.JsonValue | null;
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
                permissions: Prisma.JsonValue | null;
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
            metaValue: Prisma.JsonValue | null;
            buyerId: string;
            phoneNumber: string;
            status: string;
            errorMessage: string | null;
            errorCode: string | null;
            price: Prisma.Decimal | null;
            isRead: boolean;
            direction: string;
            fromNumber: string;
            toNumber: string;
            senderId: string | null;
            body: string;
            messageSid: string | null;
            mediaUrls: Prisma.JsonValue | null;
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: Prisma.Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: Prisma.JsonValue | null;
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: Prisma.Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: Prisma.JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
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
                permissions: Prisma.JsonValue | null;
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
            metaValue: Prisma.JsonValue | null;
            buyerId: string;
            phoneNumber: string;
            status: string;
            errorMessage: string | null;
            errorCode: string | null;
            price: Prisma.Decimal | null;
            isRead: boolean;
            direction: string;
            fromNumber: string;
            toNumber: string;
            senderId: string | null;
            body: string;
            messageSid: string | null;
            mediaUrls: Prisma.JsonValue | null;
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
            permissions: Prisma.JsonValue | null;
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
        metaValue: Prisma.JsonValue | null;
        buyerId: string;
        phoneNumber: string;
        status: string;
        errorMessage: string | null;
        errorCode: string | null;
        price: Prisma.Decimal | null;
        isRead: boolean;
        direction: string;
        fromNumber: string;
        toNumber: string;
        senderId: string | null;
        body: string;
        messageSid: string | null;
        mediaUrls: Prisma.JsonValue | null;
        numMedia: number;
        priceUnit: string | null;
        segmentCount: number;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    markAllAsRead(tenantId: string, buyerId: string): Promise<{
        updated: number;
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
                permissions: Prisma.JsonValue | null;
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
            metaValue: Prisma.JsonValue | null;
            buyerId: string;
            phoneNumber: string;
            status: string;
            errorMessage: string | null;
            errorCode: string | null;
            price: Prisma.Decimal | null;
            isRead: boolean;
            direction: string;
            fromNumber: string;
            toNumber: string;
            senderId: string | null;
            body: string;
            messageSid: string | null;
            mediaUrls: Prisma.JsonValue | null;
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
    getSmsStats(tenantId: string, buyerId?: string, senderId?: string): Promise<{
        total: number;
        sent: number;
        delivered: number;
        failed: number;
        unread: number;
    }>;
}
