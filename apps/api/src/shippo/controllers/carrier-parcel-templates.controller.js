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
exports.ShippoCarrierParcelTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoCarrierParcelTemplatesController = class ShippoCarrierParcelTemplatesController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    list(carrier, include) {
        return this.shippo.listCarrierParcelTemplates(carrier, include || 'all');
    }
    get(token) {
        return this.shippo.getCarrierParcelTemplate(token);
    }
};
exports.ShippoCarrierParcelTemplatesController = ShippoCarrierParcelTemplatesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List carrier parcel templates' }),
    (0, swagger_1.ApiQuery)({ name: 'carrier', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'include', required: false, enum: ['all', 'user', 'enabled'] }),
    __param(0, (0, common_1.Query)('carrier')),
    __param(1, (0, common_1.Query)('include')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShippoCarrierParcelTemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':token'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve a carrier parcel template by token' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoCarrierParcelTemplatesController.prototype, "get", null);
exports.ShippoCarrierParcelTemplatesController = ShippoCarrierParcelTemplatesController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Carrier Parcel Templates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/carrier-parcel-templates'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoCarrierParcelTemplatesController);
//# sourceMappingURL=carrier-parcel-templates.controller.js.map