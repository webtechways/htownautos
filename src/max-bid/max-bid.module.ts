import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { MaxBidService } from './max-bid.service';
import { MaxBidController } from './max-bid.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MaxBidController],
  providers: [MaxBidService],
  exports: [MaxBidService],
})
export class MaxBidModule {}
