import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { AuctionSaleResultsController } from './auction-sale-results.controller';
import { AuctionSaleResultsService } from './auction-sale-results.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuctionSaleResultsController],
  providers: [AuctionSaleResultsService],
  exports: [AuctionSaleResultsService],
})
export class AuctionSaleResultsModule {}
