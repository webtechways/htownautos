import { PostmarkService } from '../postmark/postmark.service';
export interface InvitationEmailData {
    to: string;
    tenantName: string;
    ownerEmail: string;
    roleName: string;
    invitationUrl: string;
    expiresAt: Date;
    inviterName?: string;
}
export declare class EmailService {
    private postmark;
    private readonly logger;
    private readonly defaultFrom;
    constructor(postmark: PostmarkService);
    sendEmail(params: {
        to: string;
        subject: string;
        htmlBody: string;
        textBody: string;
        fromName?: string;
        fromEmail?: string;
        replyTo?: string;
        tag?: string;
    }): Promise<boolean>;
    sendInvitationEmail(data: InvitationEmailData): Promise<boolean>;
    private getInvitationHtmlTemplate;
    private getInvitationTextTemplate;
}
