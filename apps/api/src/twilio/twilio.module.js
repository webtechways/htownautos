"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioModule = void 0;
const common_1 = require("@nestjs/common");
const twilio_service_1 = require("./twilio.service");
const twilio_webhook_controller_1 = require("./twilio-webhook.controller");
const twilio_client_controller_1 = require("./twilio-client.controller");
const call_flow_module_1 = require("../call-flow/call-flow.module");
const prisma_1 = require("@htownautos/prisma");
const phone_call_module_1 = require("../phone-call/phone-call.module");
const sms_module_1 = require("../sms/sms.module");
let TwilioModule = class TwilioModule {
};
exports.TwilioModule = TwilioModule;
exports.TwilioModule = TwilioModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            call_flow_module_1.CallFlowModule,
            prisma_1.PrismaModule,
            (0, common_1.forwardRef)(() => phone_call_module_1.PhoneCallModule),
            (0, common_1.forwardRef)(() => sms_module_1.SmsModule),
        ],
        controllers: [twilio_webhook_controller_1.TwilioWebhookController, twilio_client_controller_1.TwilioClientController],
        providers: [twilio_service_1.TwilioService],
        exports: [twilio_service_1.TwilioService],
    })
], TwilioModule);
//# sourceMappingURL=twilio.module.js.map