export interface PostmarkAttachmentInput {
    filename: string;
    contentType: string;
    content: string;
    contentId?: string;
}
export interface SendEmailInput {
    from: string;
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    replyTo?: string;
    attachments?: PostmarkAttachmentInput[];
    tag?: string;
    metadata?: Record<string, string>;
    messageStream?: string;
}
export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    errorCode?: number;
    errorMessage?: string;
}
export interface CreatedDomain {
    id: number;
    name: string;
    dkimHost: string;
    dkimTextValue: string;
    returnPathDomain: string;
    returnPathCNAMEValue: string;
    dkimVerified: boolean;
    returnPathVerified: boolean;
}
export interface CreatedServer {
    id: number;
    name: string;
    apiToken: string;
    inboundAddress: string;
    inboundDomain?: string;
}
export interface CreatedWebhook {
    id: number;
    url: string;
}
export interface WebhookTriggersInput {
    open?: boolean;
    click?: boolean;
    delivery?: boolean;
    bounce?: boolean;
    spamComplaint?: boolean;
    subscriptionChange?: boolean;
}
export interface BasicAuth {
    username: string;
    password: string;
}
export declare class PostmarkService {
    private readonly logger;
    private readonly serverClient;
    private readonly accountClient;
    constructor();
    sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
    sendEmailWithToken(serverToken: string, input: SendEmailInput): Promise<SendEmailResult>;
    private sendWithClient;
    createServer(params: {
        name: string;
        color?: string;
        inboundDomain?: string;
        inboundHookUrl?: string;
        trackOpens?: boolean;
        trackLinks?: 'None' | 'TextOnly' | 'HtmlOnly' | 'HtmlAndText';
        rawEmailEnabled?: boolean;
    }): Promise<CreatedServer>;
    getServer(id: number): Promise<CreatedServer>;
    findServerByName(name: string): Promise<CreatedServer | null>;
    updateServer(id: number, params: {
        inboundDomain?: string;
        inboundHookUrl?: string;
    }): Promise<void>;
    deleteServer(id: number): Promise<void>;
    createOutboundWebhook(serverToken: string, params: {
        url: string;
        basicAuth?: BasicAuth;
        triggers?: WebhookTriggersInput;
    }): Promise<CreatedWebhook>;
    createDomain(name: string): Promise<CreatedDomain>;
    getDomain(id: number): Promise<CreatedDomain>;
    findDomainByName(name: string): Promise<CreatedDomain | null>;
    verifyDkim(id: number): Promise<CreatedDomain>;
    verifyReturnPath(id: number): Promise<CreatedDomain>;
    deleteDomain(id: number): Promise<void>;
    private toCreatedDomain;
    private stripDataUrl;
}
