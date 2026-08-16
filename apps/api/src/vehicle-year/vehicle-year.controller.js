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
exports.VehicleYearController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicle_year_service_1 = require("./vehicle-year.service");
const create_vehicle_year_dto_1 = require("./dto/create-vehicle-year.dto");
const update_vehicle_year_dto_1 = require("./dto/update-vehicle-year.dto");
const query_vehicle_year_dto_1 = require("./dto/query-vehicle-year.dto");
const vehicle_year_entity_1 = require("./entities/vehicle-year.entity");
const common_2 = require("@htownautos/common");
const common_3 = require("@htownautos/common");
const auth_1 = require("@htownautos/auth");
let VehicleYearController = class VehicleYearController {
    vehicleYearService;
    constructor(vehicleYearService) {
        this.vehicleYearService = vehicleYearService;
    }
    async create(createVehicleYearDto) {
        return this.vehicleYearService.create(createVehicleYearDto);
    }
    async findAll(query) {
        return this.vehicleYearService.findAll(query);
    }
    async findOne(id) {
        return this.vehicleYearService.findOne(id);
    }
    async update(id, updateVehicleYearDto) {
        return this.vehicleYearService.update(id, updateVehicleYearDto);
    }
    async remove(id) {
        return this.vehicleYearService.remove(id);
    }
};
exports.VehicleYearController = VehicleYearController;
__decorate([
    (0, common_1.Post)(),
    (0, common_3.AuditLog)({
        action: 'create',
        resource: 'vehicle-year',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new vehicle year',
        description: 'Creates a new vehicle year entry. Year must be unique and between 1900-2100.',
    }),
    (0, swagger_1.ApiBody)({
        type: create_vehicle_year_dto_1.CreateVehicleYearDto,
        examples: {
            example1: {
                summary: 'Create year 2024',
                value: {
                    year: 2024,
                    isActive: true,
                },
            },
            example2: {
                summary: 'Create inactive year',
                value: {
                    year: 1995,
                    isActive: false,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Vehicle year successfully created',
        type: vehicle_year_entity_1.VehicleYearEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                year: 2024,
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
                    'Year must be an integer',
                    'Year must be at least 1900',
                    'Year must not exceed 2100',
                ],
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Year already exists',
        schema: {
            example: {
                statusCode: 409,
                message: 'Year 2024 already exists',
                error: 'Conflict',
            },
        },
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_year_dto_1.CreateVehicleYearDto]),
    __metadata("design:returntype", Promise)
], VehicleYearController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'vehicle-year',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all vehicle years with pagination and filters',
        description: 'Retrieves a paginated list of vehicle years. Supports filtering by year (with operators: eq, gt, lt, gte, lte) and active status.',
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
        description: 'Filter by year (4-digit integer between 1900-2100)',
        example: 2020,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'operator',
        required: false,
        enum: ['eq', 'gt', 'lt', 'gte', 'lte'],
        description: 'Comparison operator for year filter:\n' +
            '• eq - Equal to (default)\n' +
            '• gt - Greater than\n' +
            '• lt - Less than\n' +
            '• gte - Greater than or equal\n' +
            '• lte - Less than or equal\n\n' +
            '**Examples:**\n' +
            '• `?year=2020&operator=eq` - Exactly 2020\n' +
            '• `?year=2010&operator=gt` - Years after 2010 (2011, 2012...)\n' +
            '• `?year=2000&operator=lt` - Years before 2000 (1900...1999)\n' +
            '• `?year=2015&operator=gte` - Years from 2015 onwards (2015, 2016...)\n' +
            '• `?year=2005&operator=lte` - Years up to 2005 (1900...2005)',
        example: 'gte',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isActive',
        required: false,
        type: Boolean,
        description: 'Filter by active status',
        example: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully retrieved vehicle years',
        type: (common_2.PaginatedResponseDto),
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        year: 2024,
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                    {
                        id: '123e4567-e89b-12d3-a456-426614174001',
                        year: 2023,
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                ],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 128,
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
                    'Year must be an integer',
                    'Year must be at least 1900',
                    'isActive must be a boolean value',
                ],
                error: 'Bad Request',
            },
        },
    }),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_vehicle_year_dto_1.QueryVehicleYearDto]),
    __metadata("design:returntype", Promise)
], VehicleYearController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'vehicle-year',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a vehicle year by ID',
        description: 'Retrieves a single vehicle year by its UUID.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle year UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle year found',
        type: vehicle_year_entity_1.VehicleYearEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle year not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleYearController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_3.AuditLog)({
        action: 'update',
        resource: 'vehicle-year',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a vehicle year',
        description: 'Updates an existing vehicle year. All fields are optional. Year must remain unique if changed.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle year UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({ type: update_vehicle_year_dto_1.UpdateVehicleYearDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle year successfully updated',
        type: vehicle_year_entity_1.VehicleYearEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle year not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Year already exists',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_year_dto_1.UpdateVehicleYearDto]),
    __metadata("design:returntype", Promise)
], VehicleYearController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_3.AuditLog)({
        action: 'delete',
        resource: 'vehicle-year',
        level: 'high',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a vehicle year',
        description: 'Deletes a vehicle year. Cannot delete if there are related makes. Set isActive to false instead.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle year UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vehicle year successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Vehicle year with ID xxx has been successfully deleted',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle year not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Cannot delete year with related makes',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleYearController.prototype, "remove", null);
exports.VehicleYearController = VehicleYearController = __decorate([
    (0, swagger_1.ApiTags)('Vehicle Years'),
    (0, common_1.Controller)('vehicle-years'),
    (0, auth_1.TenantOptional)(),
    __metadata("design:paramtypes", [vehicle_year_service_1.VehicleYearService])
], VehicleYearController);
//# sourceMappingURL=vehicle-year.controller.js.map