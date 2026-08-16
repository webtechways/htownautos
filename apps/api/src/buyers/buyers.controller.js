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
exports.BuyersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const buyers_service_1 = require("./buyers.service");
const create_buyer_dto_1 = require("./dto/create-buyer.dto");
const update_buyer_dto_1 = require("./dto/update-buyer.dto");
const query_buyer_dto_1 = require("./dto/query-buyer.dto");
const buyer_entity_1 = require("./entities/buyer.entity");
const common_2 = require("@htownautos/common");
const common_3 = require("@htownautos/common");
const auth_1 = require("@htownautos/auth");
let BuyersController = class BuyersController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(tenantId, dto) {
        return this.service.create(dto, tenantId);
    }
    checkDuplicate(tenantId, email, phoneMain) {
        return this.service.checkDuplicate(tenantId, email, phoneMain);
    }
    findAll(tenantId, query) {
        return this.service.findAll(query, tenantId);
    }
    findOne(tenantId, id) {
        return this.service.findOne(id, tenantId);
    }
    update(tenantId, id, dto) {
        return this.service.update(id, dto, tenantId);
    }
    removeBulk(tenantId, body) {
        return this.service.removeBulk(body.ids, tenantId);
    }
    remove(tenantId, id) {
        return this.service.remove(id, tenantId);
    }
};
exports.BuyersController = BuyersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_3.AuditLog)({
        action: 'create',
        resource: 'buyer',
        level: 'high',
        pii: true,
        compliance: ['routeone', 'dealertrack', 'glba', 'fcra'],
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new buyer' }),
    (0, swagger_1.ApiBody)({
        type: create_buyer_dto_1.CreateBuyerDto,
        examples: {
            basic: {
                summary: 'Basic buyer',
                value: {
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '1985-06-15',
                    email: 'john.doe@email.com',
                    phoneMain: '(555) 123-4567',
                    currentAddress: '123 Main St',
                    currentCity: 'Houston',
                    currentState: 'TX',
                    currentZipCode: '77001',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, type: buyer_entity_1.BuyerEntity }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_buyer_dto_1.CreateBuyerDto]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('check-duplicate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check if buyer with email or phone already exists' }),
    (0, swagger_1.ApiQuery)({ name: 'email', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'phoneMain', required: false, type: String }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Returns whether email or phone already exists',
        schema: {
            type: 'object',
            properties: {
                emailExists: { type: 'boolean' },
                phoneExists: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Query)('phoneMain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "checkDuplicate", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'buyer',
        level: 'medium',
        pii: true,
        compliance: ['routeone', 'dealertrack', 'glba', 'fcra'],
    }),
    (0, swagger_1.ApiOperation)({ summary: 'List buyers (paginated)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search by name, email, or phone' }),
    (0, swagger_1.ApiQuery)({ name: 'email', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'lastName', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'phone', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'state', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'isBusinessBuyer', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: (common_2.PaginatedResponseDto) }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_buyer_dto_1.QueryBuyerDto]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'buyer',
        level: 'medium',
        pii: true,
        compliance: ['routeone', 'dealertrack', 'glba', 'fcra'],
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get a buyer by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: buyer_entity_1.BuyerEntity }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Buyer not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_3.AuditLog)({
        action: 'update',
        resource: 'buyer',
        level: 'high',
        pii: true,
        compliance: ['routeone', 'dealertrack', 'glba', 'fcra'],
        trackChanges: true,
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Update a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Buyer UUID' }),
    (0, swagger_1.ApiBody)({
        type: update_buyer_dto_1.UpdateBuyerDto,
        examples: {
            phone: {
                summary: 'Update phone',
                value: { phoneMain: '(555) 999-8888' },
            },
            address: {
                summary: 'Update address',
                value: {
                    currentAddress: '456 Oak Ave',
                    currentCity: 'Dallas',
                    currentState: 'TX',
                    currentZipCode: '75201',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: buyer_entity_1.BuyerEntity }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Buyer not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_buyer_dto_1.UpdateBuyerDto]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_3.AuditLog)({
        action: 'bulk-delete',
        resource: 'buyer',
        level: 'critical',
        pii: true,
        compliance: ['routeone', 'dealertrack', 'glba', 'fcra'],
        trackChanges: true,
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete buyers' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Buyers deleted' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'One or more buyers not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "removeBulk", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_3.AuditLog)({
        action: 'delete',
        resource: 'buyer',
        level: 'critical',
        pii: true,
        compliance: ['routeone', 'dealertrack', 'glba', 'fcra'],
        trackChanges: true,
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Buyer deleted' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Buyer not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BuyersController.prototype, "remove", null);
exports.BuyersController = BuyersController = __decorate([
    (0, swagger_1.ApiTags)('Buyers'),
    (0, common_1.Controller)('buyers'),
    __metadata("design:paramtypes", [buyers_service_1.BuyersService])
], BuyersController);
//# sourceMappingURL=buyers.controller.js.map