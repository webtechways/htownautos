import { Module } from '@nestjs/common';
import { VehicleYearService } from './vehicle-year.service';
import { VehicleYearController } from './vehicle-year.controller';
import { PrismaModule } from '@htownautos/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleYearController],
  providers: [VehicleYearService],
  exports: [VehicleYearService],
})
export class VehicleYearModule {}
