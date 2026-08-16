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
exports.ShippoOrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoOrdersController = class ShippoOrdersController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    list(page, results, orderStatus, shopApp) {
        return this.shippo.listOrders({
            page: page ? parseInt(page) : undefined,
            results: results ? parseInt(results) : undefined,
            orderStatus: orderStatus ? orderStatus.split(',') : undefined,
            shopApp,
        });
    }
    create(body) {
        return this.shippo.createOrder(body);
    }
    get(id) {
        return this.shippo.getOrder(id);
    }
};
exports.ShippoOrdersController = ShippoOrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List Shippo orders' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('results')),
    __param(2, (0, common_1.Query)('orderStatus')),
    __param(3, (0, common_1.Query)('shopApp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ShippoOrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Shippo order' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoOrdersController.prototype, "get", null);
exports.ShippoOrdersController = ShippoOrdersController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/orders'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoOrdersController);
//# sourceMappingURL=orders.controller.js.map