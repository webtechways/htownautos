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
exports.VehicleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicle_service_1 = require("./vehicle.service");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const update_vehicle_dto_1 = require("./dto/update-vehicle.dto");
const query_vehicle_dto_1 = require("./dto/query-vehicle.dto");
const vehicle_entity_1 = require("./entities/vehicle.entity");
const common_2 = require("@htownautos/common");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
let VehicleController = class VehicleController {
    vehicleService;
    constructor(vehicleService) {
        this.vehicleService = vehicleService;
    }
    create(tenantId, user, createVehicleDto) {
        return this.vehicleService.create(createVehicleDto, tenantId, user.id);
    }
    findAll(tenantId, query) {
        return this.vehicleService.findAll(query, tenantId);
    }
    getStats(tenantId) {
        return this.vehicleService.getStats(tenantId);
    }
    findByVin(tenantId, vin) {
        return this.vehicleService.findByVin(vin, tenantId);
    }
    findOneWithMetas(tenantId, id) {
        return this.vehicleService.findOneWithMetas(id, tenantId);
    }
    findOne(tenantId, id) {
        return this.vehicleService.findOne(id, tenantId);
    }
    update(tenantId, id, updateVehicleDto) {
        return this.vehicleService.update(id, updateVehicleDto, tenantId);
    }
    removeBulk(tenantId, body) {
        return this.vehicleService.removeBulk(body.ids, tenantId);
    }
    remove(tenantId, id) {
        return this.vehicleService.remove(id, tenantId);
    }
};
exports.VehicleController = VehicleController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new vehicle',
        description: 'Creates a new vehicle in the inventory. VIN must be unique. RouteOne/DealerTrack compliant.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Vehicle successfully created',
        type: vehicle_entity_1.Vehicle,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'VIN or stock number already exists' }),
    (0, common_2.AuditLog)({
        action: 'create',
        resource: 'Vehicle',
        level: 'medium',
        pii: false,
        compliance: ['RouteOne', 'DealerTrack'],
    }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_vehicle_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all vehicles',
        description: 'Retrieves all vehicles with pagination and filtering options',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of vehicles with pagination metadata',
    }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'Vehicle',
        level: 'low',
        pii: false,
    }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_vehicle_dto_1.QueryVehicleDto]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get vehicle statistics',
        description: 'Get aggregated statistics about vehicles in inventory',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Vehicle statistics',
    }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'Vehicle',
        level: 'low',
        pii: false,
    }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('vin/:vin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Find vehicle by VIN',
        description: 'Retrieves a single vehicle by its VIN',
    }),
    (0, swagger_1.ApiParam)({
        name: 'vin',
        description: 'Vehicle Identification Number',
        example: '1HGBH41JXMN109186',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Vehicle found',
        type: vehicle_entity_1.Vehicle,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'Vehicle',
        level: 'low',
        pii: false,
    }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('vin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "findByVin", null);
__decorate([
    (0, common_1.Get)(':id/with-metas'),
    (0, swagger_1.ApiOperation)({
        summary: 'Find vehicle by ID with metadata',
        description: 'Retrieves a single vehicle by its UUID including all associated metadata',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Vehicle found with metadata',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'Vehicle',
        level: 'low',
        pii: false,
    }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "findOneWithMetas", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Find vehicle by ID',
        description: 'Retrieves a single vehicle by its UUID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Vehicle found',
        type: vehicle_entity_1.Vehicle,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'Vehicle',
        level: 'low',
        pii: false,
    }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a vehicle',
        description: 'Updates an existing vehicle. All fields are optional.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Vehicle successfully updated',
        type: vehicle_entity_1.Vehicle,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'VIN or stock number conflict' }),
    (0, common_2.AuditLog)({
        action: 'update',
        resource: 'Vehicle',
        level: 'medium',
        pii: false,
        compliance: ['RouteOne', 'DealerTrack'],
        trackChanges: true,
    }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_vehicle_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk delete vehicles',
        description: 'Deletes multiple vehicles from the inventory by their IDs.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Vehicles successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                count: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'One or more vehicles not found' }),
    (0, common_2.AuditLog)({
        action: 'bulk-delete',
        resource: 'Vehicle',
        level: 'high',
        pii: false,
        compliance: ['RouteOne', 'DealerTrack', 'GLBA'],
        trackChanges: true,
    }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "removeBulk", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a vehicle',
        description: 'Deletes a vehicle from the inventory. This will cascade delete related records.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Vehicle successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Vehicle with ID xxx has been successfully deleted' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, common_2.AuditLog)({
        action: 'delete',
        resource: 'Vehicle',
        level: 'high',
        pii: false,
        compliance: ['RouteOne', 'DealerTrack', 'GLBA'],
        trackChanges: true,
    }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehicleController.prototype, "remove", null);
exports.VehicleController = VehicleController = __decorate([
    (0, swagger_1.ApiTags)('Vehicles'),
    (0, common_1.Controller)('vehicles'),
    __metadata("design:paramtypes", [vehicle_service_1.VehicleService])
], VehicleController);
//# sourceMappingURL=vehicle.controller.js.map