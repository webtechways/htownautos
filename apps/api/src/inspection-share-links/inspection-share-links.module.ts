import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { InspectionShareLinksController } from './inspection-share-links.controller';
import { InspectionShareLinksService } from './inspection-share-links.service';
import { ShortUrlModule } from '../short-url/short-url.module';
import { AuctionAnalysisModule } from '../auction-analysis/auction-analysis.module';

@Module({
  imports: [PrismaModule, ShortUrlModule, AuctionAnalysisModule],
  controllers: [InspectionShareLinksController],
  providers: [InspectionShareLinksService, S3Service],
  exports: [InspectionShareLinksService],
})
export class InspectionShareLinksModule {}
