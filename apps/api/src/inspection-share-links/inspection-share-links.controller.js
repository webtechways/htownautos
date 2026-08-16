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
exports.InspectionShareLinksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
const inspection_share_links_service_1 = require("./inspection-share-links.service");
const create_share_link_dto_1 = require("./dto/create-share-link.dto");
let InspectionShareLinksController = class InspectionShareLinksController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(tenantId, userId, id, dto) {
        return this.service.create(id, tenantId, userId, dto);
    }
    list(tenantId, id) {
        return this.service.listForInspection(id, tenantId);
    }
    revoke(tenantId, linkId) {
        return this.service.revoke(linkId, tenantId);
    }
    remove(tenantId, linkId) {
        return this.service.remove(linkId, tenantId);
    }
    resolvePublic(vin, token) {
        return this.service.resolvePublic(token, vin);
    }
};
exports.InspectionShareLinksController = InspectionShareLinksController;
__decorate([
    (0, common_1.Post)('vehicle-inspections/:id/share-links'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a public read-only share link for an inspection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, create_share_link_dto_1.CreateShareLinkDto]),
    __metadata("design:returntype", void 0)
], InspectionShareLinksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('vehicle-inspections/:id/share-links'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List share links for an inspection' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inspection UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InspectionShareLinksController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)('vehicle-inspections/share-links/:linkId'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke a share link (sets revoked=true; row stays)' }),
    (0, swagger_1.ApiParam)({ name: 'linkId', description: 'Share link UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('linkId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InspectionShareLinksController.prototype, "revoke", null);
__decorate([
    (0, common_1.Delete)('vehicle-inspections/share-links/:linkId/permanent'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Permanently delete a share link row (use after revoke).',
    }),
    (0, swagger_1.ApiParam)({ name: 'linkId', description: 'Share link UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('linkId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InspectionShareLinksController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('public/inspections/shared'),
    (0, auth_2.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Public read-only inspection view, resolved by share token + VIN',
    }),
    (0, swagger_1.ApiQuery)({ name: 'vin', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'token', required: true }),
    __param(0, (0, common_1.Query)('vin')),
    __param(1, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InspectionShareLinksController.prototype, "resolvePublic", null);
exports.InspectionShareLinksController = InspectionShareLinksController = __decorate([
    (0, swagger_1.ApiTags)('Inspection Share Links'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [inspection_share_links_service_1.InspectionShareLinksService])
], InspectionShareLinksController);
//# sourceMappingURL=inspection-share-links.controller.js.map