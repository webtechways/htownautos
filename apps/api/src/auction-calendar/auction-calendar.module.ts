import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ProxyService } from '@htownautos/common';
import { AuctionCalendarService } from './auction-calendar.service';
import { AuctionCalendarController } from './auction-calendar.controller';

// PrismaModule required because ClerkJwtGuard injects PrismaService.
// ProxyService fetches AutoBidMaster through the rotating proxy pool.
@Module({
  imports: [PrismaModule],
  controllers: [AuctionCalendarController],
  providers: [AuctionCalendarService, ProxyService],
})
export class AuctionCalendarModule {}
