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
exports.VehicleModelController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicle_model_service_1 = require("./vehicle-model.service");
const create_vehicle_model_dto_1 = require("./dto/create-vehicle-model.dto");
const update_vehicle_model_dto_1 = require("./dto/update-vehicle-model.dto");
const query_vehicle_model_dto_1 = require("./dto/query-vehicle-model.dto");
const vehicle_model_entity_1 = require("./entities/vehicle-model.entity");
const common_2 = require("@htownautos/common");
const common_3 = require("@htownautos/common");
let VehicleModelController = class VehicleModelController {
    vehicleModelService;
    constructor(vehicleModelService) {
        this.vehicleModelService = vehicleModelService;
    }
    async create(createVehicleModelDto) {
        return this.vehicleModelService.create(createVehicleModelDto);
    }
    async findAll(query) {
        return this.vehicleModelService.findAll(query);
    }
    async findOne(id) {
        return this.vehicleModelService.findOne(id);
    }
    async update(id, updateVehicleModelDto) {
        return this.vehicleModelService.update(id, updateVehicleModelDto);
    }
    async remove(id) {
        return this.vehicleModelService.remove(id);
    }
};
exports.VehicleModelController = VehicleModelController;
__decorate([
    (0, common_1.Post)(),
    (0, common_3.AuditLog)({
        action: 'create',
        resource: 'vehicle-model',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new vehicle model',
        description: 'Creates a new vehicle model for a specific make. Requires a valid makeId. Model name must be unique within the make.',
    }),
    (0, swagger_1.ApiBody)({
        type: create_vehicle_model_dto_1.CreateVehicleModelDto,
        examples: {
            example1: {
                summary: 'Create Camry for Toyota',
                value: {
                    makeId: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Camry',
                    isActive: true,
                },
            },
            example2: {
                summary: 'Create F-150 with custom slug',
                value: {
                    makeId: '123e4567-e89b-12d3-a456-426614174001',
                    name: 'F-150',
                    slug: 'f-150',
                    isActive: true,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Vehicle model successfully created',
        type: vehicle_model_entity_1.VehicleModelEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                makeId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Camry',
                slug: 'camry',
                isActive: true,
                createdAt: '2024-01-12T10:30:00.000Z',
                updatedAt: '2024-01-12T10:30:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
        schema: {
            example: {
                statusCode: 400,
                message: [
                    'makeId must be a UUID',
                    'name must be a string',
                    'name should not be empty',
                ],
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle make not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Vehicle make with ID xxx not found',
                error: 'Not Found',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Model already exists for this make',
        schema: {
            example: {
                statusCode: 409,
                message: 'Model "Camry" already exists for make Toyota',
                error: 'Conflict',
            },
        },
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_model_dto_1.CreateVehicleModelDto]),
    __metadata("design:returntype", Promise)
], VehicleModelController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'vehicle-model',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all vehicle models with pagination and filters',
        description: 'Retrieves a paginated list of vehicle models. Supports filtering by make, year, and active status.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10, max: 100)',
        example: 10,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'makeId',
        required: false,
        type: String,
        description: 'Filter by make UUID\\n\\n' +
            '**Examples:**\\n' +
            '• `?makeId=123e4567-e89b-12d3-a456-426614174000` - Get all models for a specific make',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'year',
        required: false,
        type: Number,
        description: 'Filter by year (4-digit integer between 1900-2100)\\n\\n' +
            '**Examples:**\\n' +
            '• `?year=2024` - Get all models from makes in year 2024\\n' +
            '• `?year=2020&isActive=true` - Get all active models from 2020',
        example: 2024,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isActive',
        required: false,
        type: Boolean,
        description: 'Filter by active status\\n\\n' +
            '**Examples:**\\n' +
            '• `?isActive=true` - Get only active models\\n' +
            '• `?makeId=xxx&isActive=true` - Get active models for a specific make',
        example: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully retrieved vehicle models',
        type: (common_2.PaginatedResponseDto),
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174002',
                        makeId: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Camry',
                        slug: 'camry',
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                    {
                        id: '123e4567-e89b-12d3-a456-426614174003',
                        makeId: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Corolla',
                        slug: 'corolla',
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                ],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 125,
                    totalPages: 13,
                    hasNextPage: true,
                    hasPreviousPage: false,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters',
        schema: {
            example: {
                statusCode: 400,
                message: [
                    'makeId must be a UUID',
                    'year must be an integer',
                    'isActive must be a boolean value',
                ],
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle make or year not found when filtering',
        schema: {
            example: {
                statusCode: 404,
                message: 'Vehicle make with ID xxx not found',
                error: 'Not Found',
            },
        },
    }),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_vehicle_model_dto_1.QueryVehicleModelDto]),
    __metadata("design:returntype", Promise)
], VehicleModelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'vehicle-model',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a vehicle model by ID',
        description: 'Retrieves a single vehicle model by its UUID.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle model UUID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle model found',
        type: vehicle_model_entity_1.VehicleModelEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                makeId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Camry',
                slug: 'camry',
                isActive: true,
                createdAt: '2024-01-12T10:30:00.000Z',
                updatedAt: '2024-01-12T10:30:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle model not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Vehicle model with ID xxx not found',
                error: 'Not Found',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleModelController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_3.AuditLog)({
        action: 'update',
        resource: 'vehicle-model',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a vehicle model',
        description: 'Updates an existing vehicle model. All fields are optional. Model slug must remain unique within the make if changed.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle model UUID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, swagger_1.ApiBody)({
        type: update_vehicle_model_dto_1.UpdateVehicleModelDto,
        examples: {
            example1: {
                summary: 'Update model name',
                value: {
                    name: 'Camry Hybrid',
                },
            },
            example2: {
                summary: 'Deactivate model',
                value: {
                    isActive: false,
                },
            },
            example3: {
                summary: 'Move to different make',
                value: {
                    makeId: '123e4567-e89b-12d3-a456-426614174001',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle model successfully updated',
        type: vehicle_model_entity_1.VehicleModelEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle model or make not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Model slug already exists for this make',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_model_dto_1.UpdateVehicleModelDto]),
    __metadata("design:returntype", Promise)
], VehicleModelController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_3.AuditLog)({
        action: 'delete',
        resource: 'vehicle-model',
        level: 'high',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a vehicle model',
        description: 'Deletes a vehicle model. Cannot delete if there are related trims. Set isActive to false instead.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle model UUID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle model successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Vehicle model with ID xxx has been successfully deleted',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle model not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Cannot delete model with related trims',
        schema: {
            example: {
                statusCode: 400,
                message: 'Cannot delete model with 8 related trims. Set isActive to false instead.',
                error: 'Bad Request',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleModelController.prototype, "remove", null);
exports.VehicleModelController = VehicleModelController = __decorate([
    (0, swagger_1.ApiTags)('Vehicle Models'),
    (0, common_1.Controller)('vehicle-models'),
    __metadata("design:paramtypes", [vehicle_model_service_1.VehicleModelService])
], VehicleModelController);
//# sourceMappingURL=vehicle-model.controller.js.map