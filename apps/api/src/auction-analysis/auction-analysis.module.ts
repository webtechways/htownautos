import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { AuctionAnalysisService } from './auction-analysis.service';

@Module({
  imports: [PrismaModule],
  providers: [AuctionAnalysisService],
  exports: [AuctionAnalysisService],
})
export class AuctionAnalysisModule {}
