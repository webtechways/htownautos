export declare enum EmailDirection {
    INBOUND = "inbound",
    OUTBOUND = "outbound"
}
export declare enum EmailStatus {
    DRAFT = "draft",
    QUEUED = "queued",
    SENT = "sent",
    DELIVERED = "delivered",
    BOUNCED = "bounced",
    FAILED = "failed",
    OPENED = "opened",
    CLICKED = "clicked"
}
export declare enum EmailPriority {
    HIGH = "high",
    NORMAL = "normal",
    LOW = "low"
}
export declare enum BounceType {
    HARD = "hard",
    SOFT = "soft",
    TRANSIENT = "transient"
}
export declare class CreateEmailMessageDto {
    buyerId: string;
    direction: EmailDirection;
    status?: EmailStatus;
    fromEmail: string;
    toEmail: string;
    replyTo?: string;
    ccEmails?: string[];
    bccEmails?: string[];
    subject: string;
    bodyHtml?: string;
    bodyText?: string;
    threadId?: string;
    inReplyTo?: string;
    references?: string[];
    attachments?: Array<{
        name: string;
        url: string;
        size: number;
        mimeType: string;
    }>;
    attachmentCount?: number;
    messageId?: string;
    sesStatus?: string;
    bounceType?: BounceType;
    bounceSubType?: string;
    complaintType?: string;
    isRead?: boolean;
    openCount?: number;
    clickCount?: number;
    priority?: EmailPriority;
    labels?: string[];
    scheduledAt?: string;
    sentAt?: string;
    deliveredAt?: string;
    bouncedAt?: string;
}
declare const UpdateEmailMessageDto_base: import("@nestjs/common").Type<Partial<CreateEmailMessageDto>>;
export declare class UpdateEmailMessageDto extends UpdateEmailMessageDto_base {
}
export {};
