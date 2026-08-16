"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostmarkModule = void 0;
const common_1 = require("@nestjs/common");
const postmark_service_1 = require("./postmark.service");
const postmark_webhook_controller_1 = require("./postmark-webhook.controller");
const postmark_inbound_processor_1 = require("./postmark-inbound.processor");
const postmark_event_processor_1 = require("./postmark-event.processor");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
let PostmarkModule = class PostmarkModule {
};
exports.PostmarkModule = PostmarkModule;
exports.PostmarkModule = PostmarkModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [postmark_webhook_controller_1.PostmarkWebhookController],
        providers: [
            postmark_service_1.PostmarkService,
            postmark_inbound_processor_1.PostmarkInboundProcessor,
            postmark_event_processor_1.PostmarkEventProcessor,
            prisma_1.PrismaService,
            common_2.S3Service,
        ],
        exports: [postmark_service_1.PostmarkService],
    })
], PostmarkModule);
//# sourceMappingURL=postmark.module.js.map