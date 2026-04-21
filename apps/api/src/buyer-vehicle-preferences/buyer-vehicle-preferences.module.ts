import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { BuyerVehiclePreferencesController } from './buyer-vehicle-preferences.controller';
import { BuyerVehiclePreferencesService } from './buyer-vehicle-preferences.service';

@Module({
  imports: [PrismaModule],
  controllers: [BuyerVehiclePreferencesController],
  providers: [BuyerVehiclePreferencesService],
  exports: [BuyerVehiclePreferencesService],
})
export class BuyerVehiclePreferencesModule {}
