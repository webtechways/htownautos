import { Module } from '@nestjs/common';
import { ShippoService } from './shippo.service';
import { ShippoController } from './shippo.controller';
import { ShippoAddressesController } from './controllers/addresses.controller';
import { ShippoParcelsController } from './controllers/parcels.controller';
import { ShippoShipmentsController } from './controllers/shipments.controller';
import { ShippoRatesController } from './controllers/rates.controller';
import { ShippoTransactionsController } from './controllers/transactions.controller';
import { ShippoTracksController } from './controllers/tracks.controller';
import { ShippoRefundsController } from './controllers/refunds.controller';
import { ShippoCarrierAccountsController } from './controllers/carrier-accounts.controller';
import { ShippoCarrierParcelTemplatesController } from './controllers/carrier-parcel-templates.controller';
import { ShippoUserParcelTemplatesController } from './controllers/user-parcel-templates.controller';
import {
  ShippoCustomsItemsController,
  ShippoCustomsDeclarationsController,
} from './controllers/customs.controller';
import { ShippoManifestsController } from './controllers/manifests.controller';
import { ShippoOrdersController } from './controllers/orders.controller';
import { ShippoPickupsController } from './controllers/pickups.controller';
import { ShippoServiceGroupsController } from './controllers/service-groups.controller';
import { ShippoBatchesController } from './controllers/batches.controller';
import { ShippoRatesAtCheckoutController } from './controllers/rates-at-checkout.controller';
import { ShippoWebhooksAdminController } from './controllers/webhooks-admin.controller';
import { ShippoWebhookController } from './controllers/webhook.controller';

@Module({
  controllers: [
    ShippoController,
    ShippoAddressesController,
    ShippoParcelsController,
    ShippoShipmentsController,
    ShippoRatesController,
    ShippoTransactionsController,
    ShippoTracksController,
    ShippoRefundsController,
    ShippoCarrierAccountsController,
    ShippoCarrierParcelTemplatesController,
    ShippoUserParcelTemplatesController,
    ShippoCustomsItemsController,
    ShippoCustomsDeclarationsController,
    ShippoManifestsController,
    ShippoOrdersController,
    ShippoPickupsController,
    ShippoServiceGroupsController,
    ShippoBatchesController,
    ShippoRatesAtCheckoutController,
    ShippoWebhooksAdminController,
    ShippoWebhookController,
  ],
  providers: [ShippoService],
  exports: [ShippoService],
})
export class ShippoModule {}
