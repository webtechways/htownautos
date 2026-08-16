import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { EmailEventsService } from '../presence/email-events.service';
import type { PostmarkEventWebhookDto } from './dto/postmark-event-webhook.dto';
export declare class PostmarkEventProcessor {
    private prisma;
    private emailEvents;
    private s3;
    private readonly logger;
    private readonly includeRelations;
    constructor(prisma: PrismaService, emailEvents: EmailEventsService, s3: S3Service);
    process(event: PostmarkEventWebhookDto): Promise<void>;
    private handleBounce;
    private handleComplaint;
    private handleDelivery;
    private handleOpen;
    private handleClick;
    private mapBounceType;
    private emitUpdated;
}
