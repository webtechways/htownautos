import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ProxyService, AgentAssignmentService } from '@htownautos/common';
import { AuctionCalendarService } from './auction-calendar.service';
import { AuctionCalendarController } from './auction-calendar.controller';

// PrismaModule required because ClerkJwtGuard injects PrismaService.
// ProxyService fetches AutoBidMaster through the rotating proxy pool.
@Module({
  imports: [PrismaModule],
  controllers: [AuctionCalendarController],
  providers: [AuctionCalendarService, ProxyService, AgentAssignmentService],
})
export class AuctionCalendarModule {}
