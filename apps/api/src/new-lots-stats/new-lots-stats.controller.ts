import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkJwtGuard } from '@htownautos/auth';
import { NewLotsStatsService } from './new-lots-stats.service';

/**
 * Ingest analytics over auction_listings.createdAt (when new lots first arrived)
 * and createDateTime (Copart creation time). Global, staff-only. Cached bundle.
 */
@ApiTags('New lots stats')
@Controller('auctions/new-lots-stats')
@UseGuards(ClerkJwtGuard)
@ApiBearerAuth()
export class NewLotsStatsController {
  constructor(private readonly service: NewLotsStatsService) {}

  @Get()
  @ApiOperation({ summary: 'Daily/hourly new-lot ingest stats + breakdowns' })
  stats() {
    return this.service.getStats();
  }
}
