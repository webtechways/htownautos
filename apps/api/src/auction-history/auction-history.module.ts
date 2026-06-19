import { Module } from '@nestjs/common';
import { AuctionHistoryController } from './auction-history.controller';
import { AuctionHistoryService } from './auction-history.service';

@Module({
  controllers: [AuctionHistoryController],
  providers: [AuctionHistoryService],
})
export class AuctionHistoryModule {}
