"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const presence_service_1 = require("./presence.service");
const presence_controller_1 = require("./presence.controller");
const presence_interceptor_1 = require("./presence.interceptor");
const presence_gateway_1 = require("./presence.gateway");
const phone_call_events_service_1 = require("./phone-call-events.service");
const sms_events_service_1 = require("./sms-events.service");
const stripe_events_service_1 = require("./stripe-events.service");
const email_events_service_1 = require("./email-events.service");
const prisma_1 = require("@htownautos/prisma");
let PresenceModule = class PresenceModule {
};
exports.PresenceModule = PresenceModule;
exports.PresenceModule = PresenceModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [presence_controller_1.PresenceController],
        providers: [
            presence_service_1.PresenceService,
            phone_call_events_service_1.PhoneCallEventsService,
            sms_events_service_1.SmsEventsService,
            stripe_events_service_1.StripeEventsService,
            email_events_service_1.EmailEventsService,
            presence_gateway_1.PresenceGateway,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: presence_interceptor_1.PresenceInterceptor,
            },
        ],
        exports: [
            presence_service_1.PresenceService,
            presence_gateway_1.PresenceGateway,
            phone_call_events_service_1.PhoneCallEventsService,
            sms_events_service_1.SmsEventsService,
            stripe_events_service_1.StripeEventsService,
            email_events_service_1.EmailEventsService,
        ],
    })
], PresenceModule);
//# sourceMappingURL=presence.module.js.map