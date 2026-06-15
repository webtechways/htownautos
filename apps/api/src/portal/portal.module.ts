import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { CustomerGuard } from '@htownautos/auth';
import { CopartModule } from '../copart/copart.module';
import { VehicleInspectionsModule } from '../vehicle-inspections/vehicle-inspections.module';
import { OpenSearchModule } from '../opensearch/opensearch.module';
import { BuyerFavoritesModule } from '../buyer-favorites/buyer-favorites.module';
import { PortalController } from './portal.controller';
import { PortalPublicController } from './portal-public.controller';
import { PortalService } from './portal.service';
import { PortalPricingService } from './portal-pricing.service';
import { PortalSettingsController } from './portal-settings.controller';

/**
 * PortalModule — customer-facing portal endpoints + staff pricing settings.
 *
 * PortalService is exported so StripeModule can inject it via forwardRef
 * to fulfil portal orders in the checkout.session.completed webhook.
 *
 * PortalPricingService is exported so other modules can read pricing if needed.
 */
@Module({
  imports: [PrismaModule, CopartModule, VehicleInspectionsModule, OpenSearchModule, BuyerFavoritesModule],
  controllers: [PortalPublicController, PortalController, PortalSettingsController],
  providers: [PortalService, PortalPricingService, CustomerGuard, S3Service],
  exports: [PortalService, PortalPricingService],
})
export class PortalModule {}
