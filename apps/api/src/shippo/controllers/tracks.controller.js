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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippoTracksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoTracksController = class ShippoTracksController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    register(body) {
        return this.shippo.registerTracking(body.carrier, body.trackingNumber, body.metadata);
    }
    get(carrier, trackingNumber) {
        return this.shippo.getTracking(carrier, trackingNumber);
    }
};
exports.ShippoTracksController = ShippoTracksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a tracking number (enables webhooks)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoTracksController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(':carrier/:trackingNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tracking status' }),
    __param(0, (0, common_1.Param)('carrier')),
    __param(1, (0, common_1.Param)('trackingNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShippoTracksController.prototype, "get", null);
exports.ShippoTracksController = ShippoTracksController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Tracks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/tracks'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoTracksController);
//# sourceMappingURL=tracks.controller.js.map