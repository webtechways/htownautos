import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { InspectionShareLinksController } from './inspection-share-links.controller';
import { InspectionShareLinksService } from './inspection-share-links.service';
import { ShortUrlModule } from '../short-url/short-url.module';

@Module({
  imports: [PrismaModule, ShortUrlModule],
  controllers: [InspectionShareLinksController],
  providers: [InspectionShareLinksService, S3Service],
  exports: [InspectionShareLinksService],
})
export class InspectionShareLinksModule {}
