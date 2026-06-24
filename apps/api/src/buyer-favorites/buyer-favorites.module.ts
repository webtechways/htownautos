import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ShortUrlModule } from '../short-url/short-url.module';
import { BuyerFavoritesController } from './buyer-favorites.controller';
import { BuyerFavoritesService } from './buyer-favorites.service';
import { BuyerFavoritesShareLinksService } from './buyer-favorites-share-links.service';
import { BuyerFavoritesShareLinksController } from './buyer-favorites-share-links.controller';

/**
 * BuyerFavoritesModule — customer favorite auction lots + public share links.
 *
 * Exports BuyerFavoritesService so PortalModule can mount customer-facing endpoints.
 * ShortUrlModule is imported here (not re-exported) to wire the shortener into
 * BuyerFavoritesShareLinksService only.
 */
@Module({
  imports: [PrismaModule, ShortUrlModule],
  controllers: [BuyerFavoritesController, BuyerFavoritesShareLinksController],
  providers: [BuyerFavoritesService, BuyerFavoritesShareLinksService],
  exports: [BuyerFavoritesService],
})
export class BuyerFavoritesModule {}
