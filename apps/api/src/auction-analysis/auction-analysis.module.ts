import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { AuctionAnalysisService } from './auction-analysis.service';

@Module({
  imports: [PrismaModule],
  providers: [AuctionAnalysisService, S3Service],
  exports: [AuctionAnalysisService],
})
export class AuctionAnalysisModule {}
