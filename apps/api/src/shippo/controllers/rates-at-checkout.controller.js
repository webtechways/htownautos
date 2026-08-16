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
exports.ShippoRatesAtCheckoutController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoRatesAtCheckoutController = class ShippoRatesAtCheckoutController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    createLiveRates(body) {
        return this.shippo.createLiveRates(body);
    }
    getDefault() {
        return this.shippo.getDefaultParcelTemplate();
    }
    setDefault(body) {
        return this.shippo.updateDefaultParcelTemplate(body);
    }
    deleteDefault() {
        return this.shippo.deleteDefaultParcelTemplate();
    }
};
exports.ShippoRatesAtCheckoutController = ShippoRatesAtCheckoutController;
__decorate([
    (0, common_1.Post)('live-rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Create live rates for cart checkout' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoRatesAtCheckoutController.prototype, "createLiveRates", null);
__decorate([
    (0, common_1.Get)('default-parcel-template'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the default parcel template for live rates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShippoRatesAtCheckoutController.prototype, "getDefault", null);
__decorate([
    (0, common_1.Put)('default-parcel-template'),
    (0, swagger_1.ApiOperation)({ summary: 'Set the default parcel template for live rates' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoRatesAtCheckoutController.prototype, "setDefault", null);
__decorate([
    (0, common_1.Delete)('default-parcel-template'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove the default parcel template for live rates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShippoRatesAtCheckoutController.prototype, "deleteDefault", null);
exports.ShippoRatesAtCheckoutController = ShippoRatesAtCheckoutController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Rates at Checkout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/rates-at-checkout'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoRatesAtCheckoutController);
//# sourceMappingURL=rates-at-checkout.controller.js.map