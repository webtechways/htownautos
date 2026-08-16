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
exports.VehicleTrimController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicle_trim_service_1 = require("./vehicle-trim.service");
const create_vehicle_trim_dto_1 = require("./dto/create-vehicle-trim.dto");
const update_vehicle_trim_dto_1 = require("./dto/update-vehicle-trim.dto");
const query_vehicle_trim_dto_1 = require("./dto/query-vehicle-trim.dto");
const vehicle_trim_entity_1 = require("./entities/vehicle-trim.entity");
const common_2 = require("@htownautos/common");
const common_3 = require("@htownautos/common");
let VehicleTrimController = class VehicleTrimController {
    vehicleTrimService;
    constructor(vehicleTrimService) {
        this.vehicleTrimService = vehicleTrimService;
    }
    async create(createVehicleTrimDto) {
        return this.vehicleTrimService.create(createVehicleTrimDto);
    }
    async findAll(query) {
        return this.vehicleTrimService.findAll(query);
    }
    async findOne(id) {
        return this.vehicleTrimService.findOne(id);
    }
    async update(id, updateVehicleTrimDto) {
        return this.vehicleTrimService.update(id, updateVehicleTrimDto);
    }
    async remove(id) {
        return this.vehicleTrimService.remove(id);
    }
};
exports.VehicleTrimController = VehicleTrimController;
__decorate([
    (0, common_1.Post)(),
    (0, common_3.AuditLog)({
        action: 'create',
        resource: 'vehicle-trim',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new vehicle trim',
        description: 'Creates a new vehicle trim for a specific model. Requires a valid modelId. Trim name must be unique within the model.',
    }),
    (0, swagger_1.ApiBody)({
        type: create_vehicle_trim_dto_1.CreateVehicleTrimDto,
        examples: {
            example1: {
                summary: 'Create LE trim for Camry',
                value: {
                    modelId: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'LE',
                    isActive: true,
                },
            },
            example2: {
                summary: 'Create XLE trim with custom slug',
                value: {
                    modelId: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'XLE Premium',
                    slug: 'xle-premium',
                    isActive: true,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Vehicle trim successfully created',
        type: vehicle_trim_entity_1.VehicleTrimEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                modelId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'LE',
                slug: 'le',
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
                    'modelId must be a UUID',
                    'name must be a string',
                    'name should not be empty',
                ],
                error: 'Bad Request',
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
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Trim already exists for this model',
        schema: {
            example: {
                statusCode: 409,
                message: 'Trim "LE" already exists for model Camry',
                error: 'Conflict',
            },
        },
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_trim_dto_1.CreateVehicleTrimDto]),
    __metadata("design:returntype", Promise)
], VehicleTrimController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'vehicle-trim',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all vehicle trims with pagination and filters',
        description: 'Retrieves a paginated list of vehicle trims. Supports filtering by model, make, year, and active status.',
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
        name: 'modelId',
        required: false,
        type: String,
        description: 'Filter by model UUID\\n\\n' +
            '**Examples:**\\n' +
            '• `?modelId=123e4567-e89b-12d3-a456-426614174000` - Get all trims for a specific model',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'makeId',
        required: false,
        type: String,
        description: 'Filter by make UUID\\n\\n' +
            '**Examples:**\\n' +
            '• `?makeId=123e4567-e89b-12d3-a456-426614174001` - Get all trims from models of a specific make',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'year',
        required: false,
        type: Number,
        description: 'Filter by year (4-digit integer between 1900-2100)\\n\\n' +
            '**Examples:**\\n' +
            '• `?year=2024` - Get all trims from 2024 models\\n' +
            '• `?year=2020&isActive=true` - Get all active trims from 2020',
        example: 2024,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isActive',
        required: false,
        type: Boolean,
        description: 'Filter by active status\\n\\n' +
            '**Examples:**\\n' +
            '• `?isActive=true` - Get only active trims\\n' +
            '• `?modelId=xxx&isActive=true` - Get active trims for a specific model',
        example: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully retrieved vehicle trims',
        type: (common_2.PaginatedResponseDto),
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174002',
                        modelId: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'LE',
                        slug: 'le',
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                    {
                        id: '123e4567-e89b-12d3-a456-426614174003',
                        modelId: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'XLE',
                        slug: 'xle',
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                ],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 350,
                    totalPages: 35,
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
                    'modelId must be a UUID',
                    'year must be an integer',
                    'isActive must be a boolean value',
                ],
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle model, make or year not found when filtering',
        schema: {
            example: {
                statusCode: 404,
                message: 'Vehicle model with ID xxx not found',
                error: 'Not Found',
            },
        },
    }),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_vehicle_trim_dto_1.QueryVehicleTrimDto]),
    __metadata("design:returntype", Promise)
], VehicleTrimController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'vehicle-trim',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a vehicle trim by ID',
        description: 'Retrieves a single vehicle trim by its UUID.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle trim UUID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle trim found',
        type: vehicle_trim_entity_1.VehicleTrimEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                modelId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'LE',
                slug: 'le',
                isActive: true,
                createdAt: '2024-01-12T10:30:00.000Z',
                updatedAt: '2024-01-12T10:30:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle trim not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Vehicle trim with ID xxx not found',
                error: 'Not Found',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleTrimController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_3.AuditLog)({
        action: 'update',
        resource: 'vehicle-trim',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a vehicle trim',
        description: 'Updates an existing vehicle trim. All fields are optional. Trim slug must remain unique within the model if changed.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle trim UUID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, swagger_1.ApiBody)({
        type: update_vehicle_trim_dto_1.UpdateVehicleTrimDto,
        examples: {
            example1: {
                summary: 'Update trim name',
                value: {
                    name: 'LE Premium',
                },
            },
            example2: {
                summary: 'Deactivate trim',
                value: {
                    isActive: false,
                },
            },
            example3: {
                summary: 'Move to different model',
                value: {
                    modelId: '123e4567-e89b-12d3-a456-426614174001',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle trim successfully updated',
        type: vehicle_trim_entity_1.VehicleTrimEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle trim or model not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Trim slug already exists for this model',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_trim_dto_1.UpdateVehicleTrimDto]),
    __metadata("design:returntype", Promise)
], VehicleTrimController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_3.AuditLog)({
        action: 'delete',
        resource: 'vehicle-trim',
        level: 'high',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a vehicle trim',
        description: 'Deletes a vehicle trim. Set isActive to false instead if you want to keep the record.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle trim UUID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle trim successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Vehicle trim with ID xxx has been successfully deleted',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle trim not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleTrimController.prototype, "remove", null);
exports.VehicleTrimController = VehicleTrimController = __decorate([
    (0, swagger_1.ApiTags)('Vehicle Trims'),
    (0, common_1.Controller)('vehicle-trims'),
    __metadata("design:paramtypes", [vehicle_trim_service_1.VehicleTrimService])
], VehicleTrimController);
//# sourceMappingURL=vehicle-trim.controller.js.map