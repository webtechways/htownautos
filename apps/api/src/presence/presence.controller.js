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
exports.PresenceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
const presence_service_1 = require("./presence.service");
let PresenceController = class PresenceController {
    presenceService;
    constructor(presenceService) {
        this.presenceService = presenceService;
    }
    async getTenantUsersPresence(tenantId) {
        const users = await this.presenceService.getTenantUsersPresence(tenantId);
        return { users };
    }
    async getOnlineUsers(tenantId) {
        const users = await this.presenceService.getOnlineUsers(tenantId);
        return { users };
    }
    async isUserOnline(tenantId, userId) {
        const isOnline = await this.presenceService.isUserOnline(userId, tenantId);
        return { userId, isOnline };
    }
};
exports.PresenceController = PresenceController;
__decorate([
    (0, common_1.Get)('tenant/:tenantId/users'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users presence status for a tenant',
        description: 'Returns the online/offline status and last seen time for all users in a tenant',
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        description: 'Tenant UUID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user presence statuses',
    }),
    __param(0, (0, common_1.Param)('tenantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PresenceController.prototype, "getTenantUsersPresence", null);
__decorate([
    (0, common_1.Get)('tenant/:tenantId/online'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get online users for a tenant',
        description: 'Returns only the currently online users for a tenant',
    }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        description: 'Tenant UUID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of online users',
    }),
    __param(0, (0, common_1.Param)('tenantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PresenceController.prototype, "getOnlineUsers", null);
__decorate([
    (0, common_1.Get)('tenant/:tenantId/user/:userId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if a specific user is online',
    }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant UUID' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User online status',
    }),
    __param(0, (0, common_1.Param)('tenantId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PresenceController.prototype, "isUserOnline", null);
exports.PresenceController = PresenceController = __decorate([
    (0, swagger_1.ApiTags)('Presence'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard, auth_2.TenantGuard),
    (0, common_1.Controller)('presence'),
    __metadata("design:paramtypes", [presence_service_1.PresenceService])
], PresenceController);
//# sourceMappingURL=presence.controller.js.map