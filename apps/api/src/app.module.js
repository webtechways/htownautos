"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_1 = require("@htownautos/prisma");
const redis_1 = require("@htownautos/redis");
const rabbitmq_1 = require("@htownautos/rabbitmq");
const common_2 = require("@htownautos/common");
const auth_1 = require("@htownautos/auth");
const media_1 = require("@htownautos/media");
const carfax_analyzer_1 = require("@htownautos/carfax-analyzer");
const damage_detector_1 = require("@htownautos/damage-detector");
const vehicle_year_module_1 = require("./vehicle-year/vehicle-year.module");
const vehicle_make_module_1 = require("./vehicle-make/vehicle-make.module");
const vehicle_model_module_1 = require("./vehicle-model/vehicle-model.module");
const vehicle_trim_module_1 = require("./vehicle-trim/vehicle-trim.module");
const nomenclators_module_1 = require("./nomenclators/nomenclators.module");
const extra_expense_module_1 = require("./extra-expense/extra-expense.module");
const vehicle_module_1 = require("./vehicle/vehicle.module");
const deal_module_1 = require("./deal/deal.module");
const meta_module_1 = require("./meta/meta.module");
const roles_module_1 = require("./roles/roles.module");
const tenant_module_1 = require("./tenant/tenant.module");
const parts_module_1 = require("./parts/parts.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const title_module_1 = require("./title/title.module");
const marketcheck_module_1 = require("./marketcheck/marketcheck.module");
const parts_pricing_module_1 = require("./parts-pricing/parts-pricing.module");
const max_bid_module_1 = require("./max-bid/max-bid.module");
const upload_session_module_1 = require("./upload-session/upload-session.module");
const copart_module_1 = require("./copart/copart.module");
const favorites_module_1 = require("./favorites/favorites.module");
const buyers_module_1 = require("./buyers/buyers.module");
const buyer_auction_bids_module_1 = require("./buyer-auction-bids/buyer-auction-bids.module");
const buyer_vehicle_preferences_module_1 = require("./buyer-vehicle-preferences/buyer-vehicle-preferences.module");
const buyer_favorites_module_1 = require("./buyer-favorites/buyer-favorites.module");
const vehicle_inspections_module_1 = require("./vehicle-inspections/vehicle-inspections.module");
const inspection_share_links_module_1 = require("./inspection-share-links/inspection-share-links.module");
const yards_module_1 = require("./yards/yards.module");
const email_module_1 = require("./email/email.module");
const tasks_module_1 = require("./tasks/tasks.module");
const notes_module_1 = require("./notes/notes.module");
const phone_calls_module_1 = require("./phone-calls/phone-calls.module");
const sms_module_1 = require("./sms/sms.module");
const email_messages_module_1 = require("./email-messages/email-messages.module");
const presence_module_1 = require("./presence/presence.module");
const twilio_module_1 = require("./twilio/twilio.module");
const call_flow_module_1 = require("./call-flow/call-flow.module");
const opensearch_module_1 = require("./opensearch/opensearch.module");
const title_mapping_module_1 = require("./title-mapping/title-mapping.module");
const stripe_module_1 = require("./stripe/stripe.module");
const short_url_module_1 = require("./short-url/short-url.module");
const proxy_sync_module_1 = require("./proxy-sync/proxy-sync.module");
const listing_groups_module_1 = require("./listing-groups/listing-groups.module");
const listing_reviews_module_1 = require("./listing-reviews/listing-reviews.module");
const rebuild_module_1 = require("./rebuild/rebuild.module");
const inventory_assets_module_1 = require("./inventory-assets/inventory-assets.module");
const investments_module_1 = require("./investments/investments.module");
const social_accounts_module_1 = require("./social-accounts/social-accounts.module");
const clerk_webhooks_module_1 = require("./clerk-webhooks/clerk-webhooks.module");
const shippo_module_1 = require("./shippo/shippo.module");
const parcel_templates_module_1 = require("./parcel-templates/parcel-templates.module");
const part_orders_module_1 = require("./part-orders/part-orders.module");
const api_keys_module_1 = require("./api-keys/api-keys.module");
const postmark_module_1 = require("./postmark/postmark.module");
const cloudflare_module_1 = require("./cloudflare/cloudflare.module");
const portal_module_1 = require("./portal/portal.module");
const auction_history_module_1 = require("./auction-history/auction-history.module");
const admin_seed_module_1 = require("./admin-seed/admin-seed.module");
const notifications_module_1 = require("./notifications/notifications.module");
const contact_messages_module_1 = require("./contact-messages/contact-messages.module");
const ai_translate_module_1 = require("./ai-translate/ai-translate.module");
const sync_watchdog_module_1 = require("./sync-watchdog/sync-watchdog.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([
                { name: 'short', ttl: 1000, limit: 300 },
                { name: 'medium', ttl: 60000, limit: 1000 },
                { name: 'long', ttl: 3600000, limit: 20000 },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            prisma_1.PrismaModule,
            redis_1.RedisModule,
            rabbitmq_1.RabbitMQModule,
            common_2.AuditModule,
            auth_1.AuthModule,
            media_1.MediaModule,
            carfax_analyzer_1.CarfaxAnalyzerModule,
            damage_detector_1.DamageDetectorModule,
            vehicle_year_module_1.VehicleYearModule,
            vehicle_make_module_1.VehicleMakeModule,
            vehicle_model_module_1.VehicleModelModule,
            vehicle_trim_module_1.VehicleTrimModule,
            vehicle_module_1.VehicleModule,
            deal_module_1.DealModule,
            nomenclators_module_1.NomenclatorsModule,
            extra_expense_module_1.ExtraExpenseModule,
            meta_module_1.MetaModule,
            roles_module_1.RolesModule,
            tenant_module_1.TenantModule,
            parts_module_1.PartsModule,
            title_module_1.TitleModule,
            audit_log_module_1.AuditLogModule,
            marketcheck_module_1.MarketCheckModule,
            parts_pricing_module_1.PartsPricingModule,
            max_bid_module_1.MaxBidModule,
            upload_session_module_1.UploadSessionModule,
            copart_module_1.CopartModule,
            favorites_module_1.FavoritesModule,
            buyers_module_1.BuyersModule,
            buyer_auction_bids_module_1.BuyerAuctionBidsModule,
            buyer_vehicle_preferences_module_1.BuyerVehiclePreferencesModule,
            buyer_favorites_module_1.BuyerFavoritesModule,
            vehicle_inspections_module_1.VehicleInspectionsModule,
            inspection_share_links_module_1.InspectionShareLinksModule,
            yards_module_1.YardsModule,
            email_module_1.EmailModule,
            tasks_module_1.TasksModule,
            notes_module_1.NotesModule,
            phone_calls_module_1.PhoneCallsModule,
            sms_module_1.SmsModule,
            email_messages_module_1.EmailMessagesModule,
            presence_module_1.PresenceModule,
            twilio_module_1.TwilioModule,
            call_flow_module_1.CallFlowModule,
            opensearch_module_1.OpenSearchModule,
            title_mapping_module_1.TitleMappingModule,
            stripe_module_1.StripeModule,
            short_url_module_1.ShortUrlModule,
            proxy_sync_module_1.ProxySyncModule,
            listing_groups_module_1.ListingGroupsModule,
            listing_reviews_module_1.ListingReviewsModule,
            rebuild_module_1.RebuildModule,
            inventory_assets_module_1.InventoryAssetsModule,
            investments_module_1.InvestmentsModule,
            social_accounts_module_1.SocialAccountsModule,
            clerk_webhooks_module_1.ClerkWebhooksModule,
            shippo_module_1.ShippoModule,
            parcel_templates_module_1.ParcelTemplatesModule,
            part_orders_module_1.PartOrdersModule,
            api_keys_module_1.ApiKeysModule,
            postmark_module_1.PostmarkModule,
            cloudflare_module_1.CloudflareModule,
            portal_module_1.PortalModule,
            auction_history_module_1.AuctionHistoryModule,
            admin_seed_module_1.AdminSeedModule,
            notifications_module_1.NotificationsModule,
            contact_messages_module_1.ContactMessagesModule,
            ai_translate_module_1.AiTranslateModule,
            sync_watchdog_module_1.SyncWatchdogModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map