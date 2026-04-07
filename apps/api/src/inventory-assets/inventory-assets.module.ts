import { Module } from '@nestjs/common';
import { InventoryAssetsController } from './inventory-assets.controller';
import { InventoryAssetsService } from './inventory-assets.service';
import { PrismaModule } from '@htownautos/prisma';
import { MediaModule } from '@htownautos/media';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [InventoryAssetsController],
  providers: [InventoryAssetsService],
  exports: [InventoryAssetsService],
})
export class InventoryAssetsModule {}
