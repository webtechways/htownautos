import { EmailMessagesService } from './email-messages.service';
import type { AuthenticatedUser } from '@htownautos/auth';
declare class AttachmentDto {
    filename: string;
    contentType: string;
    content: string;
    size?: number;
}
declare class SendEmailToBuyerBodyDto {
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    attachments?: AttachmentDto[];
}
export declare class EmailSendController {
    private readonly emailMessagesService;
    constructor(emailMessagesService: EmailMessagesService);
    private getTenantUserId;
    sendToBuyer(tenantId: string, user: AuthenticatedUser, buyerId: string, body: SendEmailToBuyerBodyDto): Promise<{
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
        subject: string;
        buyerId: string;
        priority: string | null;
        status: string;
        isRead: boolean;
        readAt: Date | null;
        direction: string;
        senderId: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
        fromEmail: string;
        toEmail: string;
        replyTo: string | null;
        ccEmails: import("@prisma/client/runtime/client").JsonValue | null;
        bccEmails: import("@prisma/client/runtime/client").JsonValue | null;
        bodyHtml: string | null;
        bodyText: string | null;
        threadId: string | null;
        inReplyTo: string | null;
        references: import("@prisma/client/runtime/client").JsonValue | null;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        attachmentCount: number;
        messageId: string | null;
        sesStatus: string | null;
        bounceType: string | null;
        bounceSubType: string | null;
        complaintType: string | null;
        openCount: number;
        clickCount: number;
        lastOpenedAt: Date | null;
        lastClickedAt: Date | null;
        labels: import("@prisma/client/runtime/client").JsonValue | null;
        scheduledAt: Date | null;
        bouncedAt: Date | null;
    }>;
    private estimateBase64Bytes;
}
export {};
