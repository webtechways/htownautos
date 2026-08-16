export interface PostmarkInboundAddress {
    Email: string;
    Name?: string;
    MailboxHash?: string;
}
export interface PostmarkInboundHeader {
    Name: string;
    Value: string;
}
export interface PostmarkInboundAttachment {
    Name: string;
    Content: string;
    ContentType: string;
    ContentLength: number;
    ContentID?: string;
}
export interface PostmarkInboundWebhookDto {
    FromName?: string;
    From: string;
    FromFull: PostmarkInboundAddress;
    To: string;
    ToFull: PostmarkInboundAddress[];
    Cc?: string;
    CcFull?: PostmarkInboundAddress[];
    Bcc?: string;
    BccFull?: PostmarkInboundAddress[];
    OriginalRecipient: string;
    Subject: string;
    MessageID: string;
    MessageStream?: string;
    ReplyTo?: string;
    MailboxHash?: string;
    Date: string;
    TextBody?: string;
    HtmlBody?: string;
    StrippedTextReply?: string;
    Tag?: string;
    Headers: PostmarkInboundHeader[];
    Attachments: PostmarkInboundAttachment[];
}
