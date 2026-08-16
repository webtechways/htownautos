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
exports.VehiclePartsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicle_parts_service_1 = require("./vehicle-parts.service");
const vehicle_part_dto_1 = require("./dto/vehicle-part.dto");
const auth_1 = require("@htownautos/auth");
let VehiclePartsController = class VehiclePartsController {
    vehiclePartsService;
    constructor(vehiclePartsService) {
        this.vehiclePartsService = vehiclePartsService;
    }
    findByVehicle(tenantId, vehicleId) {
        return this.vehiclePartsService.findByVehicle(vehicleId, tenantId);
    }
    getAvailableParts(tenantId, vehicleId, search) {
        return this.vehiclePartsService.getAvailableParts(tenantId, search);
    }
    associatePart(tenantId, vehicleId, dto) {
        return this.vehiclePartsService.associatePart(vehicleId, dto, tenantId);
    }
    createAndAssociate(tenantId, vehicleId, dto) {
        return this.vehiclePartsService.createAndAssociate(vehicleId, dto, tenantId);
    }
    updateAssociation(tenantId, vehicleId, vehiclePartId, dto) {
        return this.vehiclePartsService.updateAssociation(vehicleId, vehiclePartId, dto, tenantId);
    }
    removeAssociation(tenantId, vehicleId, vehiclePartId, restoreStock) {
        const shouldRestore = restoreStock === 'true';
        return this.vehiclePartsService.removeAssociation(vehicleId, vehiclePartId, tenantId, shouldRestore);
    }
};
exports.VehiclePartsController = VehiclePartsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all parts associated with a vehicle',
        description: 'Retrieves all parts that have been associated/installed on a vehicle',
    }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of vehicle parts with total' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('vehicleId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehiclePartsController.prototype, "findByVehicle", null);
__decorate([
    (0, common_1.Get)('available'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available parts from inventory',
        description: 'Retrieves parts with stock available for association',
    }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by name, part number, or SKU' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of available parts' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('vehicleId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VehiclePartsController.prototype, "getAvailableParts", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Associate an existing part to a vehicle',
        description: 'Associates an existing part from inventory to a vehicle and reduces stock',
    }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Part associated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Not enough stock' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle or part not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('vehicleId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, vehicle_part_dto_1.CreateVehiclePartDto]),
    __metadata("design:returntype", void 0)
], VehiclePartsController.prototype, "associatePart", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new part and associate it to a vehicle',
        description: 'Creates a new part in inventory AND associates it to the vehicle in one operation',
    }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Part created and associated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle, condition, or status not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('vehicleId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, vehicle_part_dto_1.CreatePartAndAssociateDto]),
    __metadata("design:returntype", void 0)
], VehiclePartsController.prototype, "createAndAssociate", null);
__decorate([
    (0, common_1.Patch)(':vehiclePartId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a vehicle-part association',
        description: 'Updates quantity, unit price, or notes of a part associated to a vehicle.',
    }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiParam)({ name: 'vehiclePartId', description: 'VehiclePart association UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Association updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle or association not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('vehicleId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('vehiclePartId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, vehicle_part_dto_1.UpdateVehiclePartDto]),
    __metadata("design:returntype", void 0)
], VehiclePartsController.prototype, "updateAssociation", null);
__decorate([
    (0, common_1.Delete)(':vehiclePartId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove a part association from a vehicle',
        description: 'Removes the association between a part and a vehicle. Optionally restores stock.',
    }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiParam)({ name: 'vehiclePartId', description: 'VehiclePart association UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'restoreStock', required: false, description: 'Whether to restore stock to inventory' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Association removed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle or association not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('vehicleId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('vehiclePartId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Query)('restoreStock')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], VehiclePartsController.prototype, "removeAssociation", null);
exports.VehiclePartsController = VehiclePartsController = __decorate([
    (0, swagger_1.ApiTags)('Vehicle Parts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('vehicles/:vehicleId/parts'),
    __metadata("design:paramtypes", [vehicle_parts_service_1.VehiclePartsService])
], VehiclePartsController);
//# sourceMappingURL=vehicle-parts.controller.js.map