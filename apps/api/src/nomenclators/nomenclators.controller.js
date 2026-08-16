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
exports.NomenclatorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nomenclators_service_1 = require("./nomenclators.service");
const create_nomenclator_dto_1 = require("./dto/create-nomenclator.dto");
const update_nomenclator_dto_1 = require("./dto/update-nomenclator.dto");
const query_nomenclator_dto_1 = require("./dto/query-nomenclator.dto");
const nomenclator_entity_1 = require("./entities/nomenclator.entity");
const common_2 = require("@htownautos/common");
const common_3 = require("@htownautos/common");
const auth_1 = require("@htownautos/auth");
let NomenclatorsController = class NomenclatorsController {
    nomenclatorsService;
    constructor(nomenclatorsService) {
        this.nomenclatorsService = nomenclatorsService;
    }
    getAvailableTypes() {
        return { types: this.nomenclatorsService.getAvailableTypes() };
    }
    async create(type, createNomenclatorDto) {
        return this.nomenclatorsService.create(type, createNomenclatorDto);
    }
    async findAll(type, query) {
        return this.nomenclatorsService.findAll(type, query);
    }
    async findOne(type, id) {
        return this.nomenclatorsService.findOne(type, id);
    }
    async findBySlug(type, slug) {
        return this.nomenclatorsService.findBySlug(type, slug);
    }
    async update(type, id, updateNomenclatorDto) {
        return this.nomenclatorsService.update(type, id, updateNomenclatorDto);
    }
    async remove(type, id) {
        return this.nomenclatorsService.remove(type, id);
    }
};
exports.NomenclatorsController = NomenclatorsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'nomenclator',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all available nomenclator types',
        description: 'Returns a list of all available nomenclator types in the system.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully retrieved nomenclator types',
        schema: {
            type: 'object',
            properties: {
                types: {
                    type: 'array',
                    items: { type: 'string' },
                    example: [
                        'sale-types',
                        'mileage-statuses',
                        'vehicle-statuses',
                        'title-statuses',
                        'vehicle-conditions',
                        'brand-statuses',
                        'vehicle-types',
                        'body-types',
                        'fuel-types',
                        'drive-types',
                        'transmission-types',
                        'vehicle-sources',
                        'inspection-statuses',
                        'activity-types',
                        'activity-statuses',
                        'user-roles',
                        'lead-sources',
                        'inquiry-types',
                        'preferred-languages',
                        'contact-methods',
                        'contact-times',
                        'genders',
                        'id-types',
                        'id-states',
                        'employment-statuses',
                        'occupations',
                        'deal-statuses',
                        'finance-types',
                    ],
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], NomenclatorsController.prototype, "getAvailableTypes", null);
__decorate([
    (0, common_1.Post)(':type'),
    (0, common_3.AuditLog)({
        action: 'create',
        resource: 'nomenclator',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new nomenclator entry',
        description: 'Creates a new entry for the specified nomenclator type.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'type',
        description: 'Nomenclator type',
        example: 'vehicle-types',
        schema: {
            type: 'string',
            enum: [
                'sale-types',
                'mileage-statuses',
                'vehicle-statuses',
                'title-statuses',
                'vehicle-conditions',
                'brand-statuses',
                'vehicle-types',
                'body-types',
                'fuel-types',
                'drive-types',
                'transmission-types',
                'vehicle-sources',
                'inspection-statuses',
                'activity-types',
                'activity-statuses',
                'user-roles',
                'lead-sources',
                'inquiry-types',
                'preferred-languages',
                'contact-methods',
                'contact-times',
                'genders',
                'id-types',
                'id-states',
                'employment-statuses',
                'occupations',
                'deal-statuses',
                'finance-types',
            ],
        },
    }),
    (0, swagger_1.ApiBody)({
        type: create_nomenclator_dto_1.CreateNomenclatorDto,
        examples: {
            example1: {
                summary: 'Create sedan body type',
                value: {
                    slug: 'sedan',
                    title: 'Sedan',
                    isActive: true,
                },
            },
            example2: {
                summary: 'Create manual transmission',
                value: {
                    slug: 'manual',
                    title: 'Manual',
                    isActive: true,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Nomenclator entry successfully created',
        type: nomenclator_entity_1.NomenclatorEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or nomenclator type',
        schema: {
            example: {
                statusCode: 400,
                message: 'Invalid nomenclator type: invalid-type',
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Slug already exists',
        schema: {
            example: {
                statusCode: 409,
                message: 'vehicle-types with slug "sedan" already exists',
                error: 'Conflict',
            },
        },
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_nomenclator_dto_1.CreateNomenclatorDto]),
    __metadata("design:returntype", Promise)
], NomenclatorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':type'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'nomenclator',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all entries for a nomenclator type',
        description: 'Retrieves a paginated list of all entries for the specified nomenclator type.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'type',
        description: 'Nomenclator type',
        example: 'vehicle-types',
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
        name: 'isActive',
        required: false,
        type: Boolean,
        description: 'Filter by active status\\n\\n' +
            '**Examples:**\\n' +
            '• `?isActive=true` - Get only active entries\\n' +
            '• `?isActive=false` - Get only inactive entries',
        example: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully retrieved nomenclator entries',
        type: (common_2.PaginatedResponseDto),
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        slug: 'sedan',
                        title: 'Sedan',
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                    {
                        id: '123e4567-e89b-12d3-a456-426614174001',
                        slug: 'suv',
                        title: 'SUV',
                        isActive: true,
                        createdAt: '2024-01-12T10:30:00.000Z',
                        updatedAt: '2024-01-12T10:30:00.000Z',
                    },
                ],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 15,
                    totalPages: 2,
                    hasNextPage: true,
                    hasPreviousPage: false,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid nomenclator type',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_nomenclator_dto_1.QueryNomenclatorDto]),
    __metadata("design:returntype", Promise)
], NomenclatorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':type/:id'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'nomenclator',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a nomenclator entry by ID',
        description: 'Retrieves a single nomenclator entry by its UUID.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'type',
        description: 'Nomenclator type',
        example: 'vehicle-types',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Nomenclator entry UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Nomenclator entry found',
        type: nomenclator_entity_1.NomenclatorEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Nomenclator entry not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid nomenclator type',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NomenclatorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':type/slug/:slug'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'nomenclator',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a nomenclator entry by slug',
        description: 'Retrieves a single nomenclator entry by its slug.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'type',
        description: 'Nomenclator type',
        example: 'vehicle-types',
    }),
    (0, swagger_1.ApiParam)({
        name: 'slug',
        description: 'Nomenclator slug',
        example: 'sedan',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Nomenclator entry found',
        type: nomenclator_entity_1.NomenclatorEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Nomenclator entry not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid nomenclator type',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NomenclatorsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Patch)(':type/:id'),
    (0, common_3.AuditLog)({
        action: 'update',
        resource: 'nomenclator',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a nomenclator entry',
        description: 'Updates an existing nomenclator entry. All fields are optional.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'type',
        description: 'Nomenclator type',
        example: 'vehicle-types',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Nomenclator entry UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        type: update_nomenclator_dto_1.UpdateNomenclatorDto,
        examples: {
            example1: {
                summary: 'Update title',
                value: {
                    title: 'Sedan Vehicle',
                },
            },
            example2: {
                summary: 'Deactivate entry',
                value: {
                    isActive: false,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Nomenclator entry successfully updated',
        type: nomenclator_entity_1.NomenclatorEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Nomenclator entry not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Slug already exists',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_nomenclator_dto_1.UpdateNomenclatorDto]),
    __metadata("design:returntype", Promise)
], NomenclatorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':type/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_3.AuditLog)({
        action: 'delete',
        resource: 'nomenclator',
        level: 'high',
        pii: false,
        compliance: ['routeone', 'dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a nomenclator entry',
        description: 'Deletes a nomenclator entry. Set isActive to false instead if you want to keep the record.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'type',
        description: 'Nomenclator type',
        example: 'vehicle-types',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Nomenclator entry UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Nomenclator entry successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'vehicle-types with ID xxx has been successfully deleted',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Nomenclator entry not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid nomenclator type',
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NomenclatorsController.prototype, "remove", null);
exports.NomenclatorsController = NomenclatorsController = __decorate([
    (0, swagger_1.ApiTags)('Nomenclators'),
    (0, common_1.Controller)('nom'),
    (0, auth_1.TenantOptional)(),
    __metadata("design:paramtypes", [nomenclators_service_1.NomenclatorsService])
], NomenclatorsController);
//# sourceMappingURL=nomenclators.controller.js.map