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
exports.VehicleInspectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const vehicle_inspections_service_1 = require("./vehicle-inspections.service");
const create_vehicle_inspection_dto_1 = require("./dto/create-vehicle-inspection.dto");
const update_vehicle_inspection_dto_1 = require("./dto/update-vehicle-inspection.dto");
const list_vehicle_inspections_dto_1 = require("./dto/list-vehicle-inspections.dto");
const create_checklist_item_dto_1 = require("./dto/create-checklist-item.dto");
const update_checklist_item_dto_1 = require("./dto/update-checklist-item.dto");
const create_request_item_dto_1 = require("./dto/create-request-item.dto");
const update_request_item_dto_1 = require("./dto/update-request-item.dto");
const create_inspection_error_code_dto_1 = require("./dto/create-inspection-error-code.dto");
const update_inspection_error_code_dto_1 = require("./dto/update-inspection-error-code.dto");
let VehicleInspectionsController = class VehicleInspectionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(tenantId, userId, query) {
        return this.service.list(tenantId, userId, query);
    }
    get(tenantId, userId, id) {
        return this.service.get(id, tenantId, userId);
    }
    create(tenantId, userId, dto) {
        return this.service.create(tenantId, userId, dto);
    }
    update(tenantId, id, dto) {
        return this.service.update(id, tenantId, dto);
    }
    remove(tenantId, id) {
        return this.service.remove(id, tenantId);
    }
    removeMany(tenantId, body) {
        return this.service.removeMany(body?.ids ?? [], tenantId);
    }
    addChecklistItem(tenantId, id, dto) {
        return this.service.addChecklistItem(id, tenantId, dto);
    }
    updateChecklistItem(tenantId, id, itemId, dto) {
        return this.service.updateChecklistItem(itemId, id, tenantId, dto);
    }
    removeChecklistItem(tenantId, id, itemId) {
        return this.service.removeChecklistItem(itemId, id, tenantId);
    }
    addRequestItem(tenantId, id, dto) {
        return this.service.addRequestItem(id, tenantId, dto);
    }
    updateRequestItem(tenantId, id, itemId, dto) {
        return this.service.updateRequestItem(itemId, id, tenantId, dto);
    }
    removeRequestItem(tenantId, id, itemId) {
        return this.service.removeRequestItem(itemId, id, tenantId);
    }
    addErrorCode(tenantId, id, dto) {
        return this.service.addErrorCode(id, tenantId, dto);
    }
    updateErrorCode(tenantId, id, itemId, dto) {
        return this.service.updateErrorCode(itemId, id, tenantId, dto);
    }
    removeErrorCode(tenantId, id, itemId) {
        return this.service.removeErrorCode(itemId, id, tenantId);
    }
};
exports.VehicleInspectionsController = VehicleInspectionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List vehicle inspections (paginated)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, list_vehicle_inspections_dto_1.ListVehicleInspectionsDto]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single inspection (with checklist + media)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create an inspection' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_vehicle_inspection_dto_1.CreateVehicleInspectionDto]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update inspection (status, rating, notes…)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_vehicle_inspection_dto_1.UpdateVehicleInspectionDto]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete an inspection (cascades the checklist + all inspection media — carfax records are NOT touched). Also deletes the underlying S3 objects (best-effort).',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk delete inspections by ids. All-or-nothing: if any id is not in the caller tenant, returns 404 and nothing is deleted. S3 cleanup is best-effort.',
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "removeMany", null);
__decorate([
    (0, common_1.Post)(':id/checklist'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a checklist item to an inspection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_checklist_item_dto_1.CreateChecklistItemDto]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "addChecklistItem", null);
__decorate([
    (0, common_1.Patch)(':id/checklist/:itemId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a checklist item (quality 1=red 2=yellow 3=green, notes, transcription…)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'Checklist item UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('itemId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_checklist_item_dto_1.UpdateChecklistItemDto]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "updateChecklistItem", null);
__decorate([
    (0, common_1.Delete)(':id/checklist/:itemId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a checklist item (cascades its media)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'Checklist item UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('itemId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "removeChecklistItem", null);
__decorate([
    (0, common_1.Post)(':id/request-items'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Add a client-request item (a note + optional photo)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_request_item_dto_1.CreateRequestItemDto]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "addRequestItem", null);
__decorate([
    (0, common_1.Patch)(':id/request-items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a client-request item' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'Request item UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('itemId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_request_item_dto_1.UpdateRequestItemDto]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "updateRequestItem", null);
__decorate([
    (0, common_1.Delete)(':id/request-items/:itemId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a client-request item (cascades its media)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'Request item UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('itemId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "removeRequestItem", null);
__decorate([
    (0, common_1.Post)(':id/error-codes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add an error code to an inspection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_inspection_error_code_dto_1.CreateInspectionErrorCodeDto]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "addErrorCode", null);
__decorate([
    (0, common_1.Patch)(':id/error-codes/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an inspection error code (level, note, transcription…)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'Error code UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('itemId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_inspection_error_code_dto_1.UpdateInspectionErrorCodeDto]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "updateErrorCode", null);
__decorate([
    (0, common_1.Delete)(':id/error-codes/:itemId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove an inspection error code (cascades its media)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'Error code UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('itemId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VehicleInspectionsController.prototype, "removeErrorCode", null);
exports.VehicleInspectionsController = VehicleInspectionsController = __decorate([
    (0, swagger_1.ApiTags)('Vehicle Inspections'),
    (0, common_1.Controller)('vehicle-inspections'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    __metadata("design:paramtypes", [vehicle_inspections_service_1.VehicleInspectionsService])
], VehicleInspectionsController);
//# sourceMappingURL=vehicle-inspections.controller.js.map