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
exports.LeadSourcesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nomenclators_service_1 = require("../nomenclators.service");
const create_nomenclator_dto_1 = require("../dto/create-nomenclator.dto");
const update_nomenclator_dto_1 = require("../dto/update-nomenclator.dto");
const query_nomenclator_dto_1 = require("../dto/query-nomenclator.dto");
const nomenclator_entity_1 = require("../entities/nomenclator.entity");
const common_2 = require("@htownautos/common");
const common_3 = require("@htownautos/common");
let LeadSourcesController = class LeadSourcesController {
    nomenclatorsService;
    constructor(nomenclatorsService) {
        this.nomenclatorsService = nomenclatorsService;
    }
    async create(createDto) {
        return this.nomenclatorsService.create('lead-sources', createDto);
    }
    async findAll(query) {
        return this.nomenclatorsService.findAll('lead-sources', query);
    }
    async findOne(id) {
        return this.nomenclatorsService.findOne('lead-sources', id);
    }
    async update(id, updateDto) {
        return this.nomenclatorsService.update('lead-sources', id, updateDto);
    }
    async remove(id) {
        return this.nomenclatorsService.remove('lead-sources', id);
    }
};
exports.LeadSourcesController = LeadSourcesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_3.AuditLog)({ action: 'create', resource: 'lead-source', level: 'medium', pii: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new lead source' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, type: nomenclator_entity_1.NomenclatorEntity }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_nomenclator_dto_1.CreateNomenclatorDto]),
    __metadata("design:returntype", Promise)
], LeadSourcesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_3.AuditLog)({ action: 'read', resource: 'lead-source', level: 'low', pii: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Get all lead sources' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: common_2.PaginatedResponseDto }),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_nomenclator_dto_1.QueryNomenclatorDto]),
    __metadata("design:returntype", Promise)
], LeadSourcesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_3.AuditLog)({ action: 'read', resource: 'lead-source', level: 'low', pii: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead source by ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: nomenclator_entity_1.NomenclatorEntity }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadSourcesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_3.AuditLog)({ action: 'update', resource: 'lead-source', level: 'medium', pii: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Update a lead source' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, type: nomenclator_entity_1.NomenclatorEntity }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_nomenclator_dto_1.UpdateNomenclatorDto]),
    __metadata("design:returntype", Promise)
], LeadSourcesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_3.AuditLog)({ action: 'delete', resource: 'lead-source', level: 'high', pii: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a lead source' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadSourcesController.prototype, "remove", null);
exports.LeadSourcesController = LeadSourcesController = __decorate([
    (0, swagger_1.ApiTags)('Nomenclators - Lead Sources'),
    (0, common_1.Controller)('nom/lead-sources'),
    __metadata("design:paramtypes", [nomenclators_service_1.NomenclatorsService])
], LeadSourcesController);
//# sourceMappingURL=lead-sources.controller.js.map