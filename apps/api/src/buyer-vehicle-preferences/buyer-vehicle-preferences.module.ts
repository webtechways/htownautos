import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { BuyerVehiclePreferencesController, BuyerMatchExclusionsController } from './buyer-vehicle-preferences.controller';
import { BuyerVehiclePreferencesService } from './buyer-vehicle-preferences.service';
import { SellerClassificationModule } from '../seller-classification/seller-classification.module';

@Module({
  imports: [PrismaModule, SellerClassificationModule],
  controllers: [BuyerVehiclePreferencesController, BuyerMatchExclusionsController],
  providers: [BuyerVehiclePreferencesService],
  exports: [BuyerVehiclePreferencesService],
})
export class BuyerVehiclePreferencesModule {}
