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
exports.ShippoShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoShipmentsController = class ShippoShipmentsController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    list(page, results, objectCreatedGte, objectCreatedLte) {
        return this.shippo.listShipments({
            page: page ? parseInt(page) : undefined,
            results: results ? parseInt(results) : undefined,
            objectCreatedGte,
            objectCreatedLte,
        });
    }
    create(body) {
        return this.shippo.createShipmentRaw(body);
    }
    get(id) {
        return this.shippo.getShipment(id);
    }
    rates(id, page, results) {
        return this.shippo.listShipmentRates(id, page ? parseInt(page) : undefined, results ? parseInt(results) : undefined);
    }
    ratesByCurrency(id, currency, page, results) {
        return this.shippo.listShipmentRatesByCurrencyCode(id, currency, page ? parseInt(page) : undefined, results ? parseInt(results) : undefined);
    }
};
exports.ShippoShipmentsController = ShippoShipmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List shipments' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('results')),
    __param(2, (0, common_1.Query)('objectCreatedGte')),
    __param(3, (0, common_1.Query)('objectCreatedLte')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ShippoShipmentsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a shipment (raw SDK shape)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoShipmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve a shipment' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoShipmentsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/rates'),
    (0, swagger_1.ApiOperation)({ summary: 'List rates for a shipment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('results')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ShippoShipmentsController.prototype, "rates", null);
__decorate([
    (0, common_1.Get)(':id/rates/:currency'),
    (0, swagger_1.ApiOperation)({ summary: 'List rates for a shipment converted to a currency' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('currency')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('results')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ShippoShipmentsController.prototype, "ratesByCurrency", null);
exports.ShippoShipmentsController = ShippoShipmentsController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Shipments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/shipments'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoShipmentsController);
//# sourceMappingURL=shipments.controller.js.map