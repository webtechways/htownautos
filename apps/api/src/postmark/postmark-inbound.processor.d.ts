import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { EmailEventsService } from '../presence/email-events.service';
import type { PostmarkInboundWebhookDto } from './dto/postmark-inbound-webhook.dto';
export declare class PostmarkInboundProcessor {
    private prisma;
    private emailEvents;
    private s3;
    private readonly logger;
    private readonly includeRelations;
    constructor(prisma: PrismaService, emailEvents: EmailEventsService, s3: S3Service);
    private uploadAttachments;
    process(payload: PostmarkInboundWebhookDto): Promise<void>;
    private parseEmail;
    private extractTenantSubdomain;
    private getHeaderValue;
    private parseReferences;
    private findThreadId;
    private emitCreated;
}
