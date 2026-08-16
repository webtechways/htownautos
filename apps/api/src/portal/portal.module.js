"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const auth_1 = require("@htownautos/auth");
const copart_module_1 = require("../copart/copart.module");
const vehicle_inspections_module_1 = require("../vehicle-inspections/vehicle-inspections.module");
const opensearch_module_1 = require("../opensearch/opensearch.module");
const buyer_favorites_module_1 = require("../buyer-favorites/buyer-favorites.module");
const stripe_module_1 = require("../stripe/stripe.module");
const auction_analysis_module_1 = require("../auction-analysis/auction-analysis.module");
const notifications_module_1 = require("../notifications/notifications.module");
const portal_controller_1 = require("./portal.controller");
const portal_public_controller_1 = require("./portal-public.controller");
const portal_service_1 = require("./portal.service");
const portal_pricing_service_1 = require("./portal-pricing.service");
const portal_settings_controller_1 = require("./portal-settings.controller");
const receipt_pdf_service_1 = require("./receipt-pdf.service");
let PortalModule = class PortalModule {
};
exports.PortalModule = PortalModule;
exports.PortalModule = PortalModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, copart_module_1.CopartModule, vehicle_inspections_module_1.VehicleInspectionsModule, opensearch_module_1.OpenSearchModule, buyer_favorites_module_1.BuyerFavoritesModule, auction_analysis_module_1.AuctionAnalysisModule, notifications_module_1.NotificationsModule, (0, common_1.forwardRef)(() => stripe_module_1.StripeModule)],
        controllers: [portal_public_controller_1.PortalPublicController, portal_controller_1.PortalController, portal_settings_controller_1.PortalSettingsController],
        providers: [portal_service_1.PortalService, portal_pricing_service_1.PortalPricingService, auth_1.CustomerGuard, common_2.S3Service, receipt_pdf_service_1.ReceiptPdfService],
        exports: [portal_service_1.PortalService, portal_pricing_service_1.PortalPricingService, receipt_pdf_service_1.ReceiptPdfService],
    })
], PortalModule);
//# sourceMappingURL=portal.module.js.map