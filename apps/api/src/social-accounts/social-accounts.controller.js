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
exports.SocialAccountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const social_accounts_service_1 = require("./social-accounts.service");
const dto_1 = require("./dto");
const auth_1 = require("@htownautos/auth");
let SocialAccountsController = class SocialAccountsController {
    service;
    constructor(service) {
        this.service = service;
    }
    getOAuthUrl(tenantId, platform, redirectUri) {
        return { url: this.service.getOAuthUrl(platform, tenantId, redirectUri) };
    }
    connect(tenantId, dto) {
        const redirectUri = dto.redirectUri || `${process.env.FRONTEND_URL}/dashboard/social-media/callback`;
        return this.service.exchangeOAuthCode(dto.platform, dto.code, redirectUri, tenantId);
    }
    connectBluesky(tenantId, body) {
        return this.service.connectBluesky(tenantId, body.identifier, body.appPassword);
    }
    manualConnect(tenantId, dto) {
        return this.service.manualConnect(tenantId, dto);
    }
    findAll(tenantId) {
        return this.service.findAll(tenantId);
    }
    findOne(tenantId, id) {
        return this.service.findOne(tenantId, id);
    }
    disconnect(tenantId, id) {
        return this.service.disconnect(tenantId, id);
    }
    findAllGroups(tenantId) {
        return this.service.findAllGroups(tenantId);
    }
    createGroup(tenantId, dto) {
        return this.service.createGroup(tenantId, dto);
    }
    updateGroup(tenantId, id, dto) {
        return this.service.updateGroup(tenantId, id, dto);
    }
    deleteGroup(tenantId, id) {
        return this.service.deleteGroup(tenantId, id);
    }
};
exports.SocialAccountsController = SocialAccountsController;
__decorate([
    (0, common_1.Get)('oauth-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get OAuth authorization URL for a platform' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('platform')),
    __param(2, (0, common_1.Query)('redirectUri')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "getOAuthUrl", null);
__decorate([
    (0, common_1.Post)('connect'),
    (0, swagger_1.ApiOperation)({ summary: 'Exchange OAuth code and connect social account(s)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connected account(s)' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ConnectSocialAccountDto]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "connect", null);
__decorate([
    (0, common_1.Post)('connect/bluesky'),
    (0, swagger_1.ApiOperation)({ summary: 'Connect Bluesky account with app password' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "connectBluesky", null);
__decorate([
    (0, common_1.Post)('connect/manual'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually connect a social account (for testing or custom integrations)' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ManualConnectSocialAccountDto]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "manualConnect", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all connected social accounts' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a social account by ID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect (delete) a social account' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Get)('groups/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all social account groups' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "findAllGroups", null);
__decorate([
    (0, common_1.Post)('groups'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a social account group' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateSocialGroupDto]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Patch)('groups/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a social account group' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateSocialGroupDto]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "updateGroup", null);
__decorate([
    (0, common_1.Delete)('groups/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a social account group' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SocialAccountsController.prototype, "deleteGroup", null);
exports.SocialAccountsController = SocialAccountsController = __decorate([
    (0, swagger_1.ApiTags)('Social Accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('social-accounts'),
    __metadata("design:paramtypes", [social_accounts_service_1.SocialAccountsService])
], SocialAccountsController);
//# sourceMappingURL=social-accounts.controller.js.map