import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { TitleMappingModule } from '../title-mapping/title-mapping.module';
import { AuctionSaleResultsController } from './auction-sale-results.controller';
import { AuctionSaleResultsService } from './auction-sale-results.service';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [PrismaModule, TitleMappingModule],
  controllers: [AuctionSaleResultsController, StatsController],
  providers: [AuctionSaleResultsService, StatsService],
  exports: [AuctionSaleResultsService, StatsService],
})
export class AuctionSaleResultsModule {}
