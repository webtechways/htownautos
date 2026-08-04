import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from '@htownautos/auth';
import { AuctionIngestGuard } from './auction-ingest.guard';
import { AuctionSaleResultsService } from './auction-sale-results.service';
import { IngestSaleResultsDto } from './dto/ingest-sale-results.dto';

/**
 * External ingestion for post-sale auction outcomes. `@Public()` bypasses the
 * global Clerk/Tenant chain; the shared-secret AuctionIngestGuard authorizes.
 * The route-level ValidationPipe relaxes `forbidNonWhitelisted` so extra
 * envelope keys around `body[]` are stripped instead of 400'd, while each item
 * is still validated.
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
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  )
  @ApiOperation({
    summary: 'Ingest scraped post-sale auction results',
    description:
      'Accepts { body: [ …items ] }. For each item, looks up the vehicle in ' +
      'auction_listings by lot number and stores a merged row (incoming sale ' +
      'data + frozen vehicle snapshot), upserted on (lot, saleDate).',
  })
  @ApiResponse({ status: 200, description: 'Ingest summary' })
  async ingest(@Body() payload: IngestSaleResultsDto) {
    return this.service.ingest(payload.body ?? []);
  }
}
