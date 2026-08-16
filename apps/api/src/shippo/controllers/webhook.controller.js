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
var ShippoWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippoWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const shippo_service_1 = require("../shippo.service");
let ShippoWebhookController = ShippoWebhookController_1 = class ShippoWebhookController {
    shippo;
    logger = new common_1.Logger(ShippoWebhookController_1.name);
    constructor(shippo) {
        this.shippo = shippo;
    }
    async receive(req) {
        const signature = req.headers['x-shippo-auth-signature'] ||
            req.headers['shippo-signature'] ||
            req.headers['x-shippo-signature'];
        const rawBody = req.body;
        if (!this.shippo.verifyWebhookSignature(rawBody, signature)) {
            this.logger.warn(`Shippo webhook signature verification failed`);
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        let event;
        try {
            event = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody));
        }
        catch {
            throw new common_1.BadRequestException('Invalid JSON body');
        }
        this.logger.log(`Shippo webhook: event=${event.event} test=${event.test ?? false}`);
        return { received: true, event: event.event };
    }
};
exports.ShippoWebhookController = ShippoWebhookController;
__decorate([
    (0, common_1.Post)(),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Receive Shippo webhook events (HMAC-verified)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShippoWebhookController.prototype, "receive", null);
exports.ShippoWebhookController = ShippoWebhookController = ShippoWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Webhooks (Inbound)'),
    (0, common_1.Controller)('shippo/webhooks'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoWebhookController);
//# sourceMappingURL=webhook.controller.js.map