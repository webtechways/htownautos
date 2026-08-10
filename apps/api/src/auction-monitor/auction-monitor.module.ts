import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { AuctionMonitorService } from './auction-monitor.service';
import { AuctionMonitorController } from './auction-monitor.controller';
import { AuctionMonitorIngestController } from './auction-monitor-ingest.controller';

// PrismaModule required because ClerkJwtGuard injects PrismaService.
// S3Service stores the page captures the worker pushes.
@Module({
  imports: [PrismaModule],
  controllers: [AuctionMonitorController, AuctionMonitorIngestController],
  providers: [AuctionMonitorService, S3Service],
})
export class AuctionMonitorModule {}
