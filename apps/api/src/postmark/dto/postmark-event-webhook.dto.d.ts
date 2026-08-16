export type PostmarkEventType = 'Bounce' | 'SpamComplaint' | 'Delivery' | 'Open' | 'Click' | 'SubscriptionChange';
export interface PostmarkEventWebhookBase {
    RecordType: PostmarkEventType;
    MessageID: string;
    MessageStream?: string;
    Recipient?: string;
    Tag?: string;
    Metadata?: Record<string, string>;
    ServerID?: number;
}
export interface PostmarkBounceEvent extends PostmarkEventWebhookBase {
    RecordType: 'Bounce';
    BouncedAt: string;
    Type: string;
    TypeCode: number;
    Name: string;
    Description: string;
    Details: string;
    Email: string;
    From: string;
    Subject: string;
    Inactive?: boolean;
}
export interface PostmarkSpamComplaintEvent extends PostmarkEventWebhookBase {
    RecordType: 'SpamComplaint';
    BouncedAt: string;
    Type: string;
    Email: string;
    From: string;
    Subject: string;
}
export interface PostmarkDeliveryEvent extends PostmarkEventWebhookBase {
    RecordType: 'Delivery';
    DeliveredAt: string;
    Details?: string;
    Recipient: string;
}
export interface PostmarkOpenEvent extends PostmarkEventWebhookBase {
    RecordType: 'Open';
    Recipient: string;
    ReceivedAt: string;
    FirstOpen: boolean;
    UserAgent?: string;
    Platform?: string;
}
export interface PostmarkClickEvent extends PostmarkEventWebhookBase {
    RecordType: 'Click';
    Recipient: string;
    ReceivedAt: string;
    OriginalLink?: string;
}
export type PostmarkEventWebhookDto = PostmarkBounceEvent | PostmarkSpamComplaintEvent | PostmarkDeliveryEvent | PostmarkOpenEvent | PostmarkClickEvent | PostmarkEventWebhookBase;
