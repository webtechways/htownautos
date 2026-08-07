import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { NewLotsStatsService } from './new-lots-stats.service';
import { NewLotsStatsController } from './new-lots-stats.controller';

// PrismaModule required because ClerkJwtGuard injects PrismaService.
@Module({
  imports: [PrismaModule],
  controllers: [NewLotsStatsController],
  providers: [NewLotsStatsService],
})
export class NewLotsStatsModule {}
