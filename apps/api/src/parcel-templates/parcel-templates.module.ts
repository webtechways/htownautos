import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ShippoModule } from '../shippo/shippo.module';
import { ParcelTemplatesController } from './parcel-templates.controller';
import { ParcelTemplatesService } from './parcel-templates.service';

@Module({
  imports: [PrismaModule, ShippoModule],
  controllers: [ParcelTemplatesController],
  providers: [ParcelTemplatesService],
  exports: [ParcelTemplatesService],
})
export class ParcelTemplatesModule {}
