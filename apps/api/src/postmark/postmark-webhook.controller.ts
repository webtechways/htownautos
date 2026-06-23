import { Body, Controller, HttpCode, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '@htownautos/auth';
import { PostmarkWebhookGuard } from './postmark-webhook.guard';
import { PostmarkInboundProcessor } from './postmark-inbound.processor';
import { PostmarkEventProcessor } from './postmark-event.processor';
import type { PostmarkInboundWebhookDto } from './dto/postmark-inbound-webhook.dto';
import type { PostmarkEventWebhookDto } from './dto/postmark-event-webhook.dto';

/**
 * Public webhook endpoints for Postmark. Secured via the PostmarkWebhookGuard
 * (shared-secret token on query string OR Basic auth header), not Clerk — so
 * they're marked @Public() to bypass the global ClerkJwtGuard/TenantGuard.
 *
 * Postmark retries non-2xx responses up to 10 times with exponential backoff,
 * so handlers must be idempotent.
 */
@ApiExcludeController()
@Public()
@Controller('email')
@UseGuards(PostmarkWebhookGuard)
export class PostmarkWebhookController {
  private readonly logger = new Logger(PostmarkWebhookController.name);

  constructor(
    private readonly inboundProcessor: PostmarkInboundProcessor,
    private readonly eventProcessor: PostmarkEventProcessor,
  ) {}

  /**
   * Inbound email webhook. Postmark posts a parsed JSON payload per incoming email.
   */
  @Post('inbound/postmark')
  @HttpCode(200)
  async handleInbound(@Body() payload: PostmarkInboundWebhookDto): Promise<{ ok: true }> {
    // Process SYNCHRONOUSLY and let failures propagate as a 500 so Postmark
    // retries delivery (up to 10x with increasing intervals over several hours)
    // instead of silently dropping the email. After the final retry Postmark
    // marks it an "Inbound Error" that can be reprocessed manually — so an
    // outage or transient bug never loses the message.
    //
    // Safe because PostmarkInboundProcessor is idempotent: it dedupes by
    // MessageID before any write, so a retry of an already-stored email is a
    // no-op. Postmark waits up to 2 minutes for our response, which is ample
    // for the S3 + DB work here.
    try {
      await this.inboundProcessor.process(payload);
    } catch (err: any) {
      this.logger.error(
        `Failed to process inbound email MessageID=${payload?.MessageID}: ${err?.message || err}`,
        err?.stack,
      );
      throw err; // → 500 → Postmark will retry
    }
    return { ok: true };
  }

  /**
   * Event webhook (bounce / delivery / complaint / open / click). Postmark discriminates
   * by the top-level "RecordType" field.
   */
  @Post('webhooks/postmark')
  @HttpCode(200)
  async handleEvent(@Body() payload: PostmarkEventWebhookDto): Promise<{ ok: true }> {
    this.eventProcessor.process(payload).catch((err) => {
      this.logger.error(
        `Failed to process Postmark event ${payload?.RecordType}/${payload?.MessageID}: ${err?.message || err}`,
        err?.stack,
      );
    });
    return { ok: true };
  }
}
