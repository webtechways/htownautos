import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { CustomerGuard } from '@htownautos/auth';
import { CopartModule } from '../copart/copart.module';
import { VehicleInspectionsModule } from '../vehicle-inspections/vehicle-inspections.module';
import { OpenSearchModule } from '../opensearch/opensearch.module';
import { BuyerFavoritesModule } from '../buyer-favorites/buyer-favorites.module';
import { StripeModule } from '../stripe/stripe.module';
import { PortalController } from './portal.controller';
import { PortalPublicController } from './portal-public.controller';
import { PortalService } from './portal.service';
import { PortalPricingService } from './portal-pricing.service';
import { PortalSettingsController } from './portal-settings.controller';
import { ReceiptPdfService } from './receipt-pdf.service';

/**
 * PortalModule — customer-facing portal endpoints + staff pricing settings.
 *
 * PortalService is exported so StripeModule can inject it via forwardRef
 * to fulfil portal orders in the checkout.session.completed webhook.
 *
 * PortalPricingService is exported so other modules can read pricing if needed.
 *
 * ReceiptPdfService is exported so StripeModule can inject it for the staff
 * receipt PDF endpoint.
 *
 * StripeModule is imported via forwardRef to break the mutual dependency cycle
 * (StripeModule → forwardRef(PortalModule) ↔ PortalModule → forwardRef(StripeModule)).
 */
@Module({
  imports: [PrismaModule, CopartModule, VehicleInspectionsModule, OpenSearchModule, BuyerFavoritesModule, forwardRef(() => StripeModule)],
  controllers: [PortalPublicController, PortalController, PortalSettingsController],
  providers: [PortalService, PortalPricingService, CustomerGuard, S3Service, ReceiptPdfService],
  exports: [PortalService, PortalPricingService, ReceiptPdfService],
})
export class PortalModule {}
