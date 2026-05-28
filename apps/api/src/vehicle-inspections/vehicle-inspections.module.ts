import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { VehicleInspectionsController } from './vehicle-inspections.controller';
import { VehicleInspectionsService } from './vehicle-inspections.service';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleInspectionsController],
  providers: [VehicleInspectionsService],
  exports: [VehicleInspectionsService],
})
export class VehicleInspectionsModule {}
