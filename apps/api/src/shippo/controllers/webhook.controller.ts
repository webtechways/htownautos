import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@htownautos/auth';
import type { Request } from 'express';
import { ShippoService } from '../shippo.service';

/**
 * Inbound Shippo webhook receiver.
 *
 * Shippo signs the payload with HMAC-SHA256 (header `X-Shippo-Auth-Signature`, format
 * `t=<timestamp>,v1=<hex>`). Verification requires the raw request body, which is why
 * `main.ts` registers `bodyParser.raw` for this exact route.
 *
 * Events we care about: `track_updated`, `transaction_created`, `transaction_updated`,
 * `batch_purchased`, `batch_creation_succeeded`, etc. See
 * https://docs.goshippo.com/docs/tracking/webhooks for the full list.
 */
@ApiTags('Shippo · Webhooks (Inbound)')
@Controller('shippo/webhooks')
export class ShippoWebhookController {
  private readonly logger = new Logger(ShippoWebhookController.name);

  constructor(private readonly shippo: ShippoService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Shippo webhook events (HMAC-verified)' })
  async receive(@Req() req: Request) {
    const signature =
      (req.headers['x-shippo-auth-signature'] as string) ||
      (req.headers['shippo-signature'] as string) ||
      (req.headers['x-shippo-signature'] as string);

    const rawBody = (req as any).body as Buffer;

    if (!this.shippo.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn(`Shippo webhook signature verification failed`);
      throw new BadRequestException('Invalid webhook signature');
    }

    let event: { event?: string; test?: boolean; data?: any };
    try {
      event = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody));
    } catch {
      throw new BadRequestException('Invalid JSON body');
    }

    this.logger.log(`Shippo webhook: event=${event.event} test=${event.test ?? false}`);

    // Hook for downstream handling (persist tracking history, update part-order
    // status, etc.). Kept intentionally minimal — extend by emitting an internal
    // event or calling a domain service here.
    return { received: true, event: event.event };
  }
}
