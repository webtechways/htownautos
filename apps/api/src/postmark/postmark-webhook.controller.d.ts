import { PostmarkInboundProcessor } from './postmark-inbound.processor';
import { PostmarkEventProcessor } from './postmark-event.processor';
import type { PostmarkInboundWebhookDto } from './dto/postmark-inbound-webhook.dto';
import type { PostmarkEventWebhookDto } from './dto/postmark-event-webhook.dto';
export declare class PostmarkWebhookController {
    private readonly inboundProcessor;
    private readonly eventProcessor;
    private readonly logger;
    constructor(inboundProcessor: PostmarkInboundProcessor, eventProcessor: PostmarkEventProcessor);
    handleInbound(payload: PostmarkInboundWebhookDto): Promise<{
        ok: true;
    }>;
    handleEvent(payload: PostmarkEventWebhookDto): Promise<{
        ok: true;
    }>;
}
