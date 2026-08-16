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
exports.ExtraExpenseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const extra_expense_service_1 = require("./extra-expense.service");
const create_extra_expense_dto_1 = require("./dto/create-extra-expense.dto");
const update_extra_expense_dto_1 = require("./dto/update-extra-expense.dto");
const query_extra_expense_dto_1 = require("./dto/query-extra-expense.dto");
const analyze_receipts_dto_1 = require("./dto/analyze-receipts.dto");
const extra_expense_entity_1 = require("./entities/extra-expense.entity");
const common_2 = require("@htownautos/common");
const common_3 = require("@htownautos/common");
let ExtraExpenseController = class ExtraExpenseController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    analyzeReceipts(dto) {
        return this.service.analyzeReceipts(dto);
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    getVehicleTotal(vehicleId) {
        return this.service.getVehicleTotal(vehicleId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.ExtraExpenseController = ExtraExpenseController;
__decorate([
    (0, common_1.Post)(),
    (0, common_3.AuditLog)({
        action: 'create',
        resource: 'extra-expense',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new extra expense' }),
    (0, swagger_1.ApiBody)({
        type: create_extra_expense_dto_1.CreateExtraExpenseDto,
        examples: {
            basic: {
                summary: 'New tires expense',
                value: {
                    vehicleId: '123e4567-e89b-12d3-a456-426614174000',
                    description: 'New tires - Michelin',
                    price: 450.0,
                },
            },
            withReceipts: {
                summary: 'Repair with receipts',
                value: {
                    vehicleId: '123e4567-e89b-12d3-a456-426614174000',
                    description: 'Engine repair',
                    price: 1250.5,
                    receiptIds: ['123e4567-e89b-12d3-a456-426614174001'],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, type: extra_expense_entity_1.ExtraExpenseEntity }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_extra_expense_dto_1.CreateExtraExpenseDto]),
    __metadata("design:returntype", Promise)
], ExtraExpenseController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('analyze-receipts'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'extra-expense',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze receipt images using AI to extract expense data' }),
    (0, swagger_1.ApiBody)({
        type: analyze_receipts_dto_1.AnalyzeReceiptsDto,
        examples: {
            basic: {
                summary: 'Analyze receipts',
                value: {
                    receiptIds: ['123e4567-e89b-12d3-a456-426614174001'],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Receipt analysis result',
        schema: {
            type: 'object',
            properties: {
                description: { type: 'string', example: 'Auto parts from AutoZone' },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            item: { type: 'string', example: 'Oil Filter' },
                            amount: { type: 'number', example: 12.99 },
                        },
                    },
                },
                shippingCost: { type: 'number', example: 9.99 },
                tax: { type: 'number', example: 3.50 },
                total: { type: 'number', example: 45.99 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_receipts_dto_1.AnalyzeReceiptsDto]),
    __metadata("design:returntype", Promise)
], ExtraExpenseController.prototype, "analyzeReceipts", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'extra-expense',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({ summary: 'List extra expenses (paginated)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'vehicleId', required: false, type: String, description: 'Filter by vehicle UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: (common_2.PaginatedResponseDto) }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_extra_expense_dto_1.QueryExtraExpenseDto]),
    __metadata("design:returntype", Promise)
], ExtraExpenseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('vehicle/:vehicleId/total'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'extra-expense',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get total expenses for a vehicle' }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        schema: { type: 'object', properties: { total: { type: 'number', example: 2750.5 } } },
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('vehicleId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExtraExpenseController.prototype, "getVehicleTotal", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_3.AuditLog)({
        action: 'read',
        resource: 'extra-expense',
        level: 'low',
        pii: false,
        compliance: ['routeone', 'dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get an extra expense by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Extra expense UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: extra_expense_entity_1.ExtraExpenseEntity }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Expense not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExtraExpenseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_3.AuditLog)({
        action: 'update',
        resource: 'extra-expense',
        level: 'medium',
        pii: false,
        compliance: ['routeone', 'dealertrack', 'glba'],
        trackChanges: true,
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Update an extra expense (vehicleId is immutable)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Extra expense UUID' }),
    (0, swagger_1.ApiBody)({
        type: update_extra_expense_dto_1.UpdateExtraExpenseDto,
        examples: {
            description: {
                summary: 'Update description',
                value: { description: 'New tires - Michelin Pilot Sport 4S' },
            },
            price: {
                summary: 'Update price',
                value: { price: 475.0 },
            },
            receipts: {
                summary: 'Set receipt images',
                value: { receiptIds: ['123e4567-e89b-12d3-a456-426614174001'] },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: extra_expense_entity_1.ExtraExpenseEntity }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Expense not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_extra_expense_dto_1.UpdateExtraExpenseDto]),
    __metadata("design:returntype", Promise)
], ExtraExpenseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_3.AuditLog)({
        action: 'delete',
        resource: 'extra-expense',
        level: 'high',
        pii: false,
        compliance: ['routeone', 'dealertrack', 'glba'],
        trackChanges: true,
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an extra expense' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Extra expense UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Expense deleted' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Expense not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExtraExpenseController.prototype, "remove", null);
exports.ExtraExpenseController = ExtraExpenseController = __decorate([
    (0, swagger_1.ApiTags)('Extra Expenses'),
    (0, common_1.Controller)('extra-expenses'),
    __metadata("design:paramtypes", [extra_expense_service_1.ExtraExpenseService])
], ExtraExpenseController);
//# sourceMappingURL=extra-expense.controller.js.map