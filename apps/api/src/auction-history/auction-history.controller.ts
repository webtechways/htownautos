import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ClerkJwtGuard } from '@htownautos/auth';
import { AuctionHistoryService } from './auction-history.service';

@ApiTags('Auction History')
@Controller('auction-history')
@UseGuards(ClerkJwtGuard)
export class AuctionHistoryController {
  constructor(private readonly auctionHistoryService: AuctionHistoryService) {}

  @Get(':vin')
  @ApiOperation({ summary: 'Get auction sale history for a VIN' })
  @ApiParam({ name: 'vin', description: 'Vehicle Identification Number', example: '1HGBH41JXMN109186' })
  async getAuctionHistory(@Param('vin') vin: string) {
    return this.auctionHistoryService.getAuctionHistory(vin);
  }
}
