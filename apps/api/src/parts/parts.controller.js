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
exports.PartsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const parts_service_1 = require("./parts.service");
const dto_1 = require("./dto");
const auth_1 = require("@htownautos/auth");
let PartsController = class PartsController {
    partsService;
    constructor(partsService) {
        this.partsService = partsService;
    }
    create(tenantId, createPartDto) {
        return this.partsService.create(tenantId, createPartDto);
    }
    findAll(tenantId, query) {
        return this.partsService.findAll(tenantId, query);
    }
    getLowStock(tenantId) {
        return this.partsService.getLowStockParts(tenantId);
    }
    backfillSkus(tenantId) {
        return this.partsService.backfillMissingSKUs(tenantId);
    }
    createCondition(tenantId, dto) {
        return this.partsService.createCondition(tenantId, dto);
    }
    findAllConditions(tenantId) {
        return this.partsService.findAllConditions(tenantId);
    }
    updateCondition(tenantId, id, dto) {
        return this.partsService.updateCondition(tenantId, id, dto);
    }
    removeCondition(tenantId, id) {
        return this.partsService.removeCondition(tenantId, id);
    }
    createStatus(tenantId, dto) {
        return this.partsService.createStatus(tenantId, dto);
    }
    findAllStatuses(tenantId) {
        return this.partsService.findAllStatuses(tenantId);
    }
    updateStatus(tenantId, id, dto) {
        return this.partsService.updateStatus(tenantId, id, dto);
    }
    removeStatus(tenantId, id) {
        return this.partsService.removeStatus(tenantId, id);
    }
    createCategory(tenantId, dto) {
        return this.partsService.createCategory(tenantId, dto);
    }
    findAllCategories(tenantId) {
        return this.partsService.findAllCategories(tenantId);
    }
    updateCategory(tenantId, id, dto) {
        return this.partsService.updateCategory(tenantId, id, dto);
    }
    removeCategory(tenantId, id) {
        return this.partsService.removeCategory(tenantId, id);
    }
    findOne(tenantId, id) {
        return this.partsService.findOne(tenantId, id);
    }
    update(tenantId, id, updatePartDto) {
        return this.partsService.update(tenantId, id, updatePartDto);
    }
    removeBulk(tenantId, body) {
        return this.partsService.removeBulk(tenantId, body.ids);
    }
    remove(tenantId, id) {
        return this.partsService.remove(tenantId, id);
    }
    adjustQuantity(tenantId, id, body) {
        return this.partsService.updateQuantity(tenantId, id, body.adjustment, body.reason);
    }
    markAsSold(tenantId, id, body) {
        return this.partsService.markAsSold(tenantId, id, body);
    }
};
exports.PartsController = PartsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new part',
        description: 'Creates a new part in the inventory',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Part created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Condition, status, or category not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreatePartDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all parts',
        description: 'Retrieves a paginated list of parts with optional filters',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of parts' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryPartDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get low stock parts',
        description: 'Retrieves parts where quantity is at or below minimum quantity',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of low stock parts' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Post)('backfill-skus'),
    (0, swagger_1.ApiOperation)({
        summary: 'Backfill missing SKUs',
        description: 'Generates SKUs for all parts that do not have one',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SKUs backfilled successfully' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "backfillSkus", null);
__decorate([
    (0, common_1.Post)('conditions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create part condition',
        description: 'Creates a new part condition (New, Used, Rebuilt, etc.)',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Condition created' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Condition slug already exists' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreatePartConditionDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "createCondition", null);
__decorate([
    (0, common_1.Get)('conditions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all part conditions',
        description: 'Retrieves all active part conditions',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of conditions' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "findAllConditions", null);
__decorate([
    (0, common_1.Patch)('conditions/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update part condition',
        description: 'Updates a part condition',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Condition UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Condition updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Condition not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdatePartConditionDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "updateCondition", null);
__decorate([
    (0, common_1.Delete)('conditions/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete part condition',
        description: 'Deletes a part condition if not in use',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Condition UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Condition deleted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Condition in use' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Condition not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "removeCondition", null);
__decorate([
    (0, common_1.Post)('statuses'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create part status',
        description: 'Creates a new part status (In Stock, Sold, Reserved, etc.)',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Status created' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Status slug already exists' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreatePartStatusDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "createStatus", null);
__decorate([
    (0, common_1.Get)('statuses'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all part statuses',
        description: 'Retrieves all active part statuses',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of statuses' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "findAllStatuses", null);
__decorate([
    (0, common_1.Patch)('statuses/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update part status',
        description: 'Updates a part status',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Status UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Status not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdatePartStatusDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)('statuses/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete part status',
        description: 'Deletes a part status if not in use',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Status UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status deleted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Status in use' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Status not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "removeStatus", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create part category',
        description: 'Creates a new part category (Engine, Body, Interior, etc.)',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Category created' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Category slug already exists' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreatePartCategoryDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all part categories',
        description: 'Retrieves all active part categories with hierarchy',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of categories' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update part category',
        description: 'Updates a part category',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Category UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdatePartCategoryDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete part category',
        description: 'Deletes a part category if not in use and has no children',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Category UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category deleted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Category in use or has children' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get part by ID',
        description: 'Retrieves a part by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Part UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Part found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Part not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update part',
        description: 'Updates a part by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Part UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Part updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Part not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdatePartDto]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk delete parts',
        description: 'Deletes multiple parts by their UUIDs',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Parts deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'One or more parts not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "removeBulk", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete part',
        description: 'Deletes a part by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Part UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Part deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Part not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/quantity'),
    (0, swagger_1.ApiOperation)({
        summary: 'Adjust part quantity',
        description: 'Adjusts the quantity of a part (positive or negative)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Part UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quantity adjusted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot reduce below 0' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Part not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "adjustQuantity", null);
__decorate([
    (0, common_1.Post)(':id/sell'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark part as sold',
        description: 'Marks a part as sold and updates inventory',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Part UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Part marked as sold' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Part or sold status not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PartsController.prototype, "markAsSold", null);
exports.PartsController = PartsController = __decorate([
    (0, swagger_1.ApiTags)('Parts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('parts'),
    __metadata("design:paramtypes", [parts_service_1.PartsService])
], PartsController);
//# sourceMappingURL=parts.controller.js.map