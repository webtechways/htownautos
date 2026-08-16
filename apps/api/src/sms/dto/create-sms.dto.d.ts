export declare enum SmsDirection {
    INBOUND = "inbound",
    OUTBOUND = "outbound"
}
export declare enum SmsStatus {
    QUEUED = "queued",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    RECEIVED = "received",
    UNDELIVERED = "undelivered"
}
export declare class CreateSmsDto {
    buyerId: string;
    direction: SmsDirection;
    status?: SmsStatus;
    phoneNumber: string;
    fromNumber: string;
    toNumber: string;
    body: string;
    messageSid?: string;
    errorCode?: string;
    errorMessage?: string;
    mediaUrls?: string[];
    numMedia?: number;
    price?: number;
    priceUnit?: string;
    segmentCount?: number;
    isRead?: boolean;
    sentAt?: string;
    deliveredAt?: string;
}
declare const UpdateSmsDto_base: import("@nestjs/common").Type<Partial<CreateSmsDto>>;
export declare class UpdateSmsDto extends UpdateSmsDto_base {
}
export {};
