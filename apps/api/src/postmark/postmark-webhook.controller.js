"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PostmarkWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostmarkWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const postmark_webhook_guard_1 = require("./postmark-webhook.guard");
const postmark_inbound_processor_1 = require("./postmark-inbound.processor");
const postmark_event_processor_1 = require("./postmark-event.processor");
let PostmarkWebhookController = PostmarkWebhookController_1 = class PostmarkWebhookController {
    inboundProcessor;
    eventProcessor;
    logger = new common_1.Logger(PostmarkWebhookController_1.name);
    constructor(inboundProcessor, eventProcessor) {
        this.inboundProcessor = inboundProcessor;
        this.eventProcessor = eventProcessor;
    }
    async handleInbound(payload) {
        try {
            await this.inboundProcessor.process(payload);
        }
        catch (err) {
            this.logger.error(`Failed to process inbound email MessageID=${payload?.MessageID}: ${err?.message || err}`, err?.stack);
            throw err;
        }
        return { ok: true };
    }
    async handleEvent(payload) {
        this.eventProcessor.process(payload).catch((err) => {
            this.logger.error(`Failed to process Postmark event ${payload?.RecordType}/${payload?.MessageID}: ${err?.message || err}`, err?.stack);
        });
        return { ok: true };
    }
};
exports.PostmarkWebhookController = PostmarkWebhookController;
__decorate([
    (0, common_1.Post)('inbound/postmark'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostmarkWebhookController.prototype, "handleInbound", null);
__decorate([
    (0, common_1.Post)('webhooks/postmark'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostmarkWebhookController.prototype, "handleEvent", null);
exports.PostmarkWebhookController = PostmarkWebhookController = PostmarkWebhookController_1 = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, auth_1.Public)(),
    (0, common_1.Controller)('email'),
    (0, common_1.UseGuards)(postmark_webhook_guard_1.PostmarkWebhookGuard),
    __metadata("design:paramtypes", [postmark_inbound_processor_1.PostmarkInboundProcessor,
        postmark_event_processor_1.PostmarkEventProcessor])
], PostmarkWebhookController);
//# sourceMappingURL=postmark-webhook.controller.js.map