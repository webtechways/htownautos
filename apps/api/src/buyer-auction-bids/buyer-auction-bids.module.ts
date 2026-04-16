import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { BuyerAuctionBidsController } from './buyer-auction-bids.controller';
import { BuyerAuctionBidsService } from './buyer-auction-bids.service';

@Module({
  imports: [PrismaModule],
  controllers: [BuyerAuctionBidsController],
  providers: [BuyerAuctionBidsService],
  exports: [BuyerAuctionBidsService],
})
export class BuyerAuctionBidsModule {}
