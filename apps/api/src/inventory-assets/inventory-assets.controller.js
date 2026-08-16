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
exports.InventoryAssetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_assets_service_1 = require("./inventory-assets.service");
const dto_1 = require("./dto");
const auth_1 = require("@htownautos/auth");
let InventoryAssetsController = class InventoryAssetsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(tenantId, dto) {
        return this.service.create(tenantId, dto);
    }
    analyzeUrl(body) {
        return this.service.analyzeUrl(body.url);
    }
    analyzeImages(body) {
        return this.service.analyzeImages(body.mediaIds);
    }
    analyzeReceiptItems(body) {
        return this.service.analyzeReceiptItems(body.mediaIds);
    }
    bulkCreate(tenantId, body) {
        return this.service.bulkCreate(tenantId, body.assets);
    }
    getStats(tenantId) {
        return this.service.getStats(tenantId);
    }
    findAll(tenantId, query) {
        return this.service.findAll(tenantId, query);
    }
    findOne(tenantId, id) {
        return this.service.findOne(tenantId, id);
    }
    update(tenantId, id, dto) {
        return this.service.update(tenantId, id, dto);
    }
    remove(tenantId, id) {
        return this.service.remove(tenantId, id);
    }
};
exports.InventoryAssetsController = InventoryAssetsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new inventory asset' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asset created successfully' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateInventoryAssetDto]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('analyze-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze a product URL with AI to extract asset info' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analysis result with product details and images' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "analyzeUrl", null);
__decorate([
    (0, common_1.Post)('analyze-images'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze asset images with AI to extract product info' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analysis result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "analyzeImages", null);
__decorate([
    (0, common_1.Post)('analyze-receipt-items'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze receipt images and extract individual line items' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Receipt data with individual items array' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "analyzeReceiptItems", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple inventory assets at once' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Assets created successfully' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory asset stats (total items and value)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stats' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all inventory assets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of inventory assets' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryInventoryAssetDto]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an inventory asset by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an inventory asset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateInventoryAssetDto]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an inventory asset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InventoryAssetsController.prototype, "remove", null);
exports.InventoryAssetsController = InventoryAssetsController = __decorate([
    (0, swagger_1.ApiTags)('Inventory Assets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('inventory-assets'),
    __metadata("design:paramtypes", [inventory_assets_service_1.InventoryAssetsService])
], InventoryAssetsController);
//# sourceMappingURL=inventory-assets.controller.js.map