import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from '@htownautos/auth';
import { AuctionIngestGuard } from './auction-ingest.guard';
import { AuctionSaleResultsService } from './auction-sale-results.service';
import type { SaleResultItemDto } from './dto/ingest-sale-results.dto';

/**
 * External ingestion for post-sale auction outcomes. `@Public()` bypasses the
 * global Clerk/Tenant chain; the shared-secret AuctionIngestGuard authorizes.
 *
 * Payload-tolerant: accepts a bare array `[ …items ]` (what the n8n webhook
 * sends), an envelope `{ body: [ …items ] }`, or a single item object. Items
 * are best-effort — the service validates/coerces per item and skips bad ones.
 */
@ApiTags('Auction Sale Results')
@ApiSecurity('x-api-key')
@Controller('auction-sale-results')
@Public()
@UseGuards(AuctionIngestGuard)
export class AuctionSaleResultsController {
  constructor(private readonly service: AuctionSaleResultsService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ingest scraped post-sale auction results',
    description:
      'Accepts a bare array [ …items ], { body: [ …items ] }, or a single item. ' +
      'For each item, looks up the vehicle in auction_listings by lot number and ' +
      'stores a merged row (incoming sale data + frozen vehicle snapshot), ' +
      'upserted on (lot, saleDate).',
  })
  @ApiResponse({ status: 200, description: 'Ingest summary' })
  async ingest(@Body() payload: unknown) {
    const items = this.normalize(payload);
    return this.service.ingest(items);
  }

  /** Coerce any accepted payload shape into an items array. */
  private normalize(payload: unknown): SaleResultItemDto[] {
    if (Array.isArray(payload)) return payload as SaleResultItemDto[];
    if (payload && typeof payload === 'object') {
      const body = (payload as any).body;
      if (Array.isArray(body)) return body as SaleResultItemDto[];
      // A single item object with a lot → wrap it.
      if ('lot' in (payload as any)) return [payload as SaleResultItemDto];
    }
    return [];
  }
}
