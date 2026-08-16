"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippoModule = void 0;
const common_1 = require("@nestjs/common");
const shippo_service_1 = require("./shippo.service");
const shippo_controller_1 = require("./shippo.controller");
const addresses_controller_1 = require("./controllers/addresses.controller");
const parcels_controller_1 = require("./controllers/parcels.controller");
const shipments_controller_1 = require("./controllers/shipments.controller");
const rates_controller_1 = require("./controllers/rates.controller");
const transactions_controller_1 = require("./controllers/transactions.controller");
const tracks_controller_1 = require("./controllers/tracks.controller");
const refunds_controller_1 = require("./controllers/refunds.controller");
const carrier_accounts_controller_1 = require("./controllers/carrier-accounts.controller");
const carrier_parcel_templates_controller_1 = require("./controllers/carrier-parcel-templates.controller");
const user_parcel_templates_controller_1 = require("./controllers/user-parcel-templates.controller");
const customs_controller_1 = require("./controllers/customs.controller");
const manifests_controller_1 = require("./controllers/manifests.controller");
const orders_controller_1 = require("./controllers/orders.controller");
const pickups_controller_1 = require("./controllers/pickups.controller");
const service_groups_controller_1 = require("./controllers/service-groups.controller");
const batches_controller_1 = require("./controllers/batches.controller");
const rates_at_checkout_controller_1 = require("./controllers/rates-at-checkout.controller");
const webhooks_admin_controller_1 = require("./controllers/webhooks-admin.controller");
const webhook_controller_1 = require("./controllers/webhook.controller");
let ShippoModule = class ShippoModule {
};
exports.ShippoModule = ShippoModule;
exports.ShippoModule = ShippoModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            shippo_controller_1.ShippoController,
            addresses_controller_1.ShippoAddressesController,
            parcels_controller_1.ShippoParcelsController,
            shipments_controller_1.ShippoShipmentsController,
            rates_controller_1.ShippoRatesController,
            transactions_controller_1.ShippoTransactionsController,
            tracks_controller_1.ShippoTracksController,
            refunds_controller_1.ShippoRefundsController,
            carrier_accounts_controller_1.ShippoCarrierAccountsController,
            carrier_parcel_templates_controller_1.ShippoCarrierParcelTemplatesController,
            user_parcel_templates_controller_1.ShippoUserParcelTemplatesController,
            customs_controller_1.ShippoCustomsItemsController,
            customs_controller_1.ShippoCustomsDeclarationsController,
            manifests_controller_1.ShippoManifestsController,
            orders_controller_1.ShippoOrdersController,
            pickups_controller_1.ShippoPickupsController,
            service_groups_controller_1.ShippoServiceGroupsController,
            batches_controller_1.ShippoBatchesController,
            rates_at_checkout_controller_1.ShippoRatesAtCheckoutController,
            webhooks_admin_controller_1.ShippoWebhooksAdminController,
            webhook_controller_1.ShippoWebhookController,
        ],
        providers: [shippo_service_1.ShippoService],
        exports: [shippo_service_1.ShippoService],
    })
], ShippoModule);
//# sourceMappingURL=shippo.module.js.map