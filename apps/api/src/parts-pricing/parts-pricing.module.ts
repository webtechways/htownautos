import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { PartsPricingService } from './parts-pricing.service';
import { PartsPricingController } from './parts-pricing.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PartsPricingController],
  providers: [PartsPricingService],
  exports: [PartsPricingService],
})
export class PartsPricingModule {}
