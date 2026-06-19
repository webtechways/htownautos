import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { AuctionHistoryController } from './auction-history.controller';
import { AuctionHistoryService } from './auction-history.service';

// PrismaModule is imported so the class-level @UseGuards(ClerkJwtGuard) can
// resolve its dependencies (same pattern as YardsModule). Without it Nest fails
// to instantiate the guard and the whole app crashes on boot.
@Module({
  imports: [PrismaModule],
  controllers: [AuctionHistoryController],
  providers: [AuctionHistoryService],
})
export class AuctionHistoryModule {}
