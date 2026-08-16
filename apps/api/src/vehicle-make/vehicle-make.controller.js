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
exports.VehicleMakeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicle_make_service_1 = require("./vehicle-make.service");
const create_vehicle_make_dto_1 = require("./dto/create-vehicle-make.dto");
const update_vehicle_make_dto_1 = require("./dto/update-vehicle-make.dto");
const query_vehicle_make_dto_1 = require("./dto/query-vehicle-make.dto");
const vehicle_make_entity_1 = require("./entities/vehicle-make.entity");
const common_2 = require("@htownautos/common");
const common_3 = require("@htownautos/common");
let VehicleMakeController = class VehicleMakeController {
    vehicleMakeService;
    constructor(vehicleMakeService) {
        this.vehicleMakeService = vehicleMakeService;
    }
    async create(createVehicleMakeDto) {
        return this.vehicleMakeService.create(createVehicleMakeDto);
    }
    async findAll(query) {
        return this.vehicleMakeService.findAll(query);
    }
    async findOne(id) {
        return this.vehicleMakeService.findOne(id);
    }
    async update(id, updateVehicleMakeDto) {
        return this.vehicleMakeService.update(id, updateVehicleMakeDto);
    }
    async remove(id) {
        return this.vehicleMakeService.remove(id);
    }
};
exports.VehicleMakeController = VehicleMakeController;
__decorate([
    (0, common_1.Post)(),
    (0, common_3.AuditLog)({
        action: 'create',
        resource: 'vehicle-make',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new vehicle make',
        description: 'Creates a new vehicle make for a specific year. Requires a valid yearId. Make name must be unique within the year.',
    }),
    (0, swagger_1.ApiBody)({
        type: create_vehicle_make_dto_1.CreateVehicleMakeDto,
        examples: {
            example1: {
                summary: 'Create Toyota for 2024',
                value: {
                    yearId: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Toyota',
                    isActive: true,
                },
            },
            example2: {
                summary: 'Create Ford with custom slug',
                value: {
                    yearId: '123e4567-e89b-12d3-a456-426614174001',
                    name: 'Ford Motor Company',
                    slug: 'ford',
                    isActive: true,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Vehicle make successfully created',
        type: vehicle_make_entity_1.VehicleMakeEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                yearId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Toyota',
                slug: 'toyota',
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
                    'yearId must be a UUID',
                    'name must be a string',
                    'name should not be empty',
                ],
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle year not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Vehicle year with ID xxx not found',
                error: 'Not Found',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Make already exists for this year',
        schema: {
            example: {
                statusCode: 409,
                message: 'Make "Toyota" already exists for year 2024',
                error: 'Conflict',
            },
        },
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_make_dto_1.CreateVehicleMakeDto]),
    __metadata("design:returntype", Promise)
], VehicleMakeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'vehicle-make',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all vehicle makes with pagination and filters',
        description: 'Retrieves a paginated list of vehicle makes. Supports filtering by year and active status.',
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
        name: 'year',
        required: false,
        type: Number,
        description: 'Filter by year (4-digit integer between 1900-2100)\\n\\n' +
            '**Examples:**\\n' +
            '• `?year=2024` - Get all makes for year 2024\\n' +
            '• `?year=2020&isActive=true` - Get all active makes for 2020',
        example: 2024,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isActive',
        required: false,
        type: Boolean,
        description: 'Filter by active status\\n\\n' +
            '**Examples:**\\n' +
            '• `?isActive=true` - Get only active makes\\n' +
            '• `?isActive=false` - Get only inactive makes\\n' +
            '• `?year=2024&isActive=true` - Get active makes for 2024',
        example: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully retrieved vehicle makes',
        type: (common_2.PaginatedResponseDto),
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174002',
                        yearId: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Toyota',
                        slug: 'toyota',
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                    {
                        id: '123e4567-e89b-12d3-a456-426614174003',
                        yearId: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Ford',
                        slug: 'ford',
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                ],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 45,
                    totalPages: 5,
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
                    'Year must be an integer',
                    'Year must be at least 1900',
                    'isActive must be a boolean value',
                ],
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle year not found when filtering by year',
        schema: {
            example: {
                statusCode: 404,
                message: 'Vehicle year 2050 not found',
                error: 'Not Found',
            },
        },
    }),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_vehicle_make_dto_1.QueryVehicleMakeDto]),
    __metadata("design:returntype", Promise)
], VehicleMakeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'vehicle-make',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a vehicle make by ID',
        description: 'Retrieves a single vehicle make by its UUID.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle make UUID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle make found',
        type: vehicle_make_entity_1.VehicleMakeEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174002',
                yearId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Toyota',
                slug: 'toyota',
                isActive: true,
                createdAt: '2024-01-12T10:30:00.000Z',
                updatedAt: '2024-01-12T10:30:00.000Z',
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
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleMakeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_3.AuditLog)({
        action: 'update',
        resource: 'vehicle-make',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a vehicle make',
        description: 'Updates an existing vehicle make. All fields are optional. Make slug must remain unique within the year if changed.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle make UUID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, swagger_1.ApiBody)({
        type: update_vehicle_make_dto_1.UpdateVehicleMakeDto,
        examples: {
            example1: {
                summary: 'Update make name',
                value: {
                    name: 'Toyota Motor Corporation',
                },
            },
            example2: {
                summary: 'Deactivate make',
                value: {
                    isActive: false,
                },
            },
            example3: {
                summary: 'Move to different year',
                value: {
                    yearId: '123e4567-e89b-12d3-a456-426614174001',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle make successfully updated',
        type: vehicle_make_entity_1.VehicleMakeEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle make or year not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Make slug already exists for this year',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_make_dto_1.UpdateVehicleMakeDto]),
    __metadata("design:returntype", Promise)
], VehicleMakeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_3.AuditLog)({
        action: 'delete',
        resource: 'vehicle-make',
        level: 'high',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a vehicle make',
        description: 'Deletes a vehicle make. Cannot delete if there are related models. Set isActive to false instead.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle make UUID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle make successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Vehicle make with ID xxx has been successfully deleted',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle make not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Cannot delete make with related models',
        schema: {
            example: {
                statusCode: 400,
                message: 'Cannot delete make with 15 related models. Set isActive to false instead.',
                error: 'Bad Request',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleMakeController.prototype, "remove", null);
exports.VehicleMakeController = VehicleMakeController = __decorate([
    (0, swagger_1.ApiTags)('Vehicle Makes'),
    (0, common_1.Controller)('vehicle-makes'),
    __metadata("design:paramtypes", [vehicle_make_service_1.VehicleMakeService])
], VehicleMakeController);
//# sourceMappingURL=vehicle-make.controller.js.map