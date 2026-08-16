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
exports.MetaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const meta_service_1 = require("./meta.service");
const create_meta_dto_1 = require("./dto/create-meta.dto");
const update_meta_dto_1 = require("./dto/update-meta.dto");
const query_meta_dto_1 = require("./dto/query-meta.dto");
const meta_entity_1 = require("./entities/meta.entity");
const common_2 = require("@htownautos/common");
let MetaController = class MetaController {
    metaService;
    constructor(metaService) {
        this.metaService = metaService;
    }
    create(createMetaDto) {
        return this.metaService.create(createMetaDto);
    }
    bulkCreate(createMetaDtos) {
        return this.metaService.bulkCreate(createMetaDtos);
    }
    findAll(queryDto) {
        return this.metaService.findAll(queryDto);
    }
    findByEntity(entityType, entityId) {
        return this.metaService.findByEntity(entityType, entityId);
    }
    findByEntityAndKey(entityType, entityId, key) {
        return this.metaService.findByEntityAndKey(entityType, entityId, key);
    }
    findOne(id) {
        return this.metaService.findOne(id);
    }
    update(id, updateMetaDto) {
        return this.metaService.update(id, updateMetaDto);
    }
    async remove(id) {
        await this.metaService.remove(id);
    }
    async deleteByEntity(entityType, entityId) {
        await this.metaService.deleteByEntity(entityType, entityId);
    }
    async hardDelete(id) {
        await this.metaService.hardDelete(id);
    }
};
exports.MetaController = MetaController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new meta entry',
        description: 'Creates a new metadata entry for any entity in the system',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Meta created successfully',
        type: meta_entity_1.Meta,
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Meta with same key already exists' }),
    (0, common_2.AuditLog)({
        action: 'create',
        resource: 'meta',
        level: 'medium',
        pii: false,
        compliance: [],
        trackChanges: true,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_meta_dto_1.CreateMetaDto]),
    __metadata("design:returntype", void 0)
], MetaController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk create meta entries',
        description: 'Creates multiple metadata entries at once',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Metas created successfully',
        type: [meta_entity_1.Meta],
    }),
    (0, common_2.AuditLog)({
        action: 'bulk_create',
        resource: 'meta',
        level: 'medium',
        pii: false,
        compliance: [],
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], MetaController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all metas',
        description: 'Retrieves all metadata entries with optional filters',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of metas',
    }),
    (0, common_2.AuditLog)({
        action: 'list',
        resource: 'meta',
        level: 'low',
        pii: false,
        compliance: [],
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_meta_dto_1.QueryMetaDto]),
    __metadata("design:returntype", void 0)
], MetaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all metas for an entity',
        description: 'Retrieves all metadata for a specific entity',
    }),
    (0, swagger_1.ApiParam)({ name: 'entityType', description: 'Type of entity' }),
    (0, swagger_1.ApiParam)({ name: 'entityId', description: 'ID of entity' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of metas for the entity',
        type: [meta_entity_1.Meta],
    }),
    (0, common_2.AuditLog)({
        action: 'list_by_entity',
        resource: 'meta',
        level: 'low',
        pii: false,
        compliance: [],
    }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MetaController.prototype, "findByEntity", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId/key/:key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a specific meta by entity and key',
        description: 'Retrieves a specific metadata entry by entity and key',
    }),
    (0, swagger_1.ApiParam)({ name: 'entityType', description: 'Type of entity' }),
    (0, swagger_1.ApiParam)({ name: 'entityId', description: 'ID of entity' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'Meta key' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Meta entry',
        type: meta_entity_1.Meta,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Meta not found' }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'meta',
        level: 'low',
        pii: false,
        compliance: [],
    }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MetaController.prototype, "findByEntityAndKey", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a meta by ID',
        description: 'Retrieves a specific metadata entry by ID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Meta ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Meta entry',
        type: meta_entity_1.Meta,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Meta not found' }),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'meta',
        level: 'low',
        pii: false,
        compliance: [],
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MetaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a meta',
        description: 'Updates an existing metadata entry',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Meta ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Meta updated successfully',
        type: meta_entity_1.Meta,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Meta not found' }),
    (0, common_2.AuditLog)({
        action: 'update',
        resource: 'meta',
        level: 'medium',
        pii: false,
        compliance: [],
        trackChanges: true,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_meta_dto_1.UpdateMetaDto]),
    __metadata("design:returntype", void 0)
], MetaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete a meta',
        description: 'Soft deletes a metadata entry (marks as deleted)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Meta ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Meta deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Meta not found' }),
    (0, common_2.AuditLog)({
        action: 'delete',
        resource: 'meta',
        level: 'high',
        pii: false,
        compliance: [],
        trackChanges: true,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('entity/:entityType/:entityId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete all metas for an entity',
        description: 'Soft deletes all metadata entries for a specific entity',
    }),
    (0, swagger_1.ApiParam)({ name: 'entityType', description: 'Type of entity' }),
    (0, swagger_1.ApiParam)({ name: 'entityId', description: 'ID of entity' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'All metas for entity deleted successfully',
    }),
    (0, common_2.AuditLog)({
        action: 'delete_by_entity',
        resource: 'meta',
        level: 'high',
        pii: false,
        compliance: [],
    }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "deleteByEntity", null);
__decorate([
    (0, common_1.Delete)('hard/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Hard delete a meta (Admin only)',
        description: 'Permanently deletes a metadata entry from database',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Meta ID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Meta permanently deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Meta not found' }),
    (0, common_2.AuditLog)({
        action: 'hard_delete',
        resource: 'meta',
        level: 'critical',
        pii: false,
        compliance: [],
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetaController.prototype, "hardDelete", null);
exports.MetaController = MetaController = __decorate([
    (0, swagger_1.ApiTags)('Meta'),
    (0, common_1.Controller)('meta'),
    __metadata("design:paramtypes", [meta_service_1.MetaService])
], MetaController);
//# sourceMappingURL=meta.controller.js.map