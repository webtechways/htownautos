import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ShippoModule } from '../shippo/shippo.module';
import { StripeModule } from '../stripe/stripe.module';
import { PartOrdersController } from './part-orders.controller';
import { PartOrdersService } from './part-orders.service';

@Module({
  imports: [PrismaModule, ShippoModule, forwardRef(() => StripeModule)],
  controllers: [PartOrdersController],
  providers: [PartOrdersService],
  exports: [PartOrdersService],
})
export class PartOrdersModule {}
