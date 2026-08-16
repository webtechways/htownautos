"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const sms_module_1 = require("../sms/sms.module");
const short_url_module_1 = require("../short-url/short-url.module");
const stripe_controller_1 = require("./stripe.controller");
const stripe_webhook_controller_1 = require("./stripe-webhook.controller");
const stripe_service_1 = require("./stripe.service");
const portal_module_1 = require("../portal/portal.module");
let StripeModule = class StripeModule {
};
exports.StripeModule = StripeModule;
exports.StripeModule = StripeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_1.PrismaModule,
            sms_module_1.SmsModule,
            short_url_module_1.ShortUrlModule,
            (0, common_1.forwardRef)(() => portal_module_1.PortalModule),
        ],
        controllers: [stripe_controller_1.StripeController, stripe_webhook_controller_1.StripeWebhookController],
        providers: [stripe_service_1.StripeService],
        exports: [stripe_service_1.StripeService],
    })
], StripeModule);
//# sourceMappingURL=stripe.module.js.map