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
exports.ShippoBatchesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoBatchesController = class ShippoBatchesController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    create(body) {
        return this.shippo.createBatch(body);
    }
    get(id, page, results) {
        return this.shippo.getBatch(id, page ? parseInt(page) : undefined, results ? parseInt(results) : undefined);
    }
    addShipments(id, body) {
        return this.shippo.addShipmentsToBatch(id, body);
    }
    removeShipments(id, body) {
        return this.shippo.removeShipmentsFromBatch(id, body);
    }
    purchase(id) {
        return this.shippo.purchaseBatch(id);
    }
};
exports.ShippoBatchesController = ShippoBatchesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a batch' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoBatchesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve a batch (paginates shipments)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('results')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ShippoBatchesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/add-shipments'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Add shipments to a batch' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], ShippoBatchesController.prototype, "addShipments", null);
__decorate([
    (0, common_1.Post)(':id/remove-shipments'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove shipments from a batch' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], ShippoBatchesController.prototype, "removeShipments", null);
__decorate([
    (0, common_1.Post)(':id/purchase'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Purchase all labels in a batch' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoBatchesController.prototype, "purchase", null);
exports.ShippoBatchesController = ShippoBatchesController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Batches'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/batches'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoBatchesController);
//# sourceMappingURL=batches.controller.js.map