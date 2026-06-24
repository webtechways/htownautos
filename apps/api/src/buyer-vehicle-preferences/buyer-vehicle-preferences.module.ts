import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { BuyerVehiclePreferencesController, BuyerMatchExclusionsController } from './buyer-vehicle-preferences.controller';
import { BuyerVehiclePreferencesService } from './buyer-vehicle-preferences.service';

@Module({
  imports: [PrismaModule],
  controllers: [BuyerVehiclePreferencesController, BuyerMatchExclusionsController],
  providers: [BuyerVehiclePreferencesService],
  exports: [BuyerVehiclePreferencesService],
})
export class BuyerVehiclePreferencesModule {}
