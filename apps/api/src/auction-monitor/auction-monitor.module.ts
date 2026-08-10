import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { AuctionMonitorService } from './auction-monitor.service';
import { AuctionMonitorController } from './auction-monitor.controller';

// PrismaModule required because ClerkJwtGuard injects PrismaService.
@Module({
  imports: [PrismaModule],
  controllers: [AuctionMonitorController],
  providers: [AuctionMonitorService],
})
export class AuctionMonitorModule {}
