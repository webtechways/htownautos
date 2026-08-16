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
exports.PartOrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const part_orders_service_1 = require("./part-orders.service");
const order_dto_1 = require("./dto/order.dto");
let PartOrdersController = class PartOrdersController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(tenantId, page, limit, status, search, buyerId) {
        return this.service.findAll(tenantId, {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            status,
            search,
            buyerId,
        });
    }
    findOne(tenantId, id) {
        return this.service.findOne(tenantId, id);
    }
    create(tenantId, user, dto) {
        return this.service.create(tenantId, dto, user?.id);
    }
    update(tenantId, id, dto) {
        return this.service.update(tenantId, id, dto);
    }
    cancel(tenantId, id) {
        return this.service.cancel(tenantId, id);
    }
    removeBulk(tenantId, body) {
        return this.service.removeBulk(tenantId, body.ids);
    }
    remove(tenantId, id) {
        return this.service.remove(tenantId, id);
    }
    charge(tenantId, user, id, dto) {
        return this.service.charge(tenantId, id, dto, user?.id);
    }
    markPaid(tenantId, id, body) {
        return this.service.markPaid(tenantId, id, body?.method);
    }
    estimateShipping(tenantId, dto) {
        return this.service.estimateShipping(tenantId, dto);
    }
    getRates(tenantId, id, dto) {
        return this.service.getRates(tenantId, id, dto);
    }
    buyLabel(tenantId, id, dto) {
        const { rateId, ...shipmentContext } = dto;
        return this.service.buyLabel(tenantId, id, rateId, shipmentContext);
    }
    refreshTracking(tenantId, id, shipmentId) {
        return this.service.refreshTracking(tenantId, id, shipmentId);
    }
};
exports.PartOrdersController = PartOrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('buyerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order (defaults to draft status)' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "cancel", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete draft orders' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "removeBulk", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/charge'),
    (0, swagger_1.ApiOperation)({ summary: 'Charge the order via Stripe (direct or payment link)' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, order_dto_1.ChargeOrderDto]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "charge", null);
__decorate([
    (0, common_1.Post)(':id/mark-paid'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark order as paid manually (cash, check, etc.)' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Post)('estimate-shipping'),
    (0, swagger_1.ApiOperation)({ summary: 'Estimate shipping cost for an address + items (no order needed)' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.EstimateShippingDto]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "estimateShipping", null);
__decorate([
    (0, common_1.Post)(':id/rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get UPS shipping rates for an order' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, order_dto_1.CreateShipmentDto]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "getRates", null);
__decorate([
    (0, common_1.Post)(':id/buy-label'),
    (0, swagger_1.ApiOperation)({ summary: 'Purchase a UPS shipping label' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "buyLabel", null);
__decorate([
    (0, common_1.Post)(':id/shipments/:shipmentId/refresh-tracking'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('shipmentId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PartOrdersController.prototype, "refreshTracking", null);
exports.PartOrdersController = PartOrdersController = __decorate([
    (0, swagger_1.ApiTags)('Part Orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('part-orders'),
    __metadata("design:paramtypes", [part_orders_service_1.PartOrdersService])
], PartOrdersController);
//# sourceMappingURL=part-orders.controller.js.map