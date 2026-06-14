import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { BuyerFavoritesController } from './buyer-favorites.controller';
import { BuyerFavoritesService } from './buyer-favorites.service';

/**
 * BuyerFavoritesModule — customer favorite auction lots.
 *
 * Exposes the staff/dashboard controller here and exports the service so the
 * PortalModule can mount customer-facing endpoints on PortalController.
 */
@Module({
  imports: [PrismaModule],
  controllers: [BuyerFavoritesController],
  providers: [BuyerFavoritesService],
  exports: [BuyerFavoritesService],
})
export class BuyerFavoritesModule {}
