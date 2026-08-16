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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_1 = require("@htownautos/prisma");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
let PermissionsGuard = class PermissionsGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = request.tenant?.id || request.headers['x-tenant-id'];
        if (!user) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        if (!tenantId) {
            throw new common_1.ForbiddenException('Tenant context required (X-Tenant-ID header missing)');
        }
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: {
                    tenantId: tenantId,
                    userId: user.id || user.sub,
                },
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        if (!tenantUser) {
            throw new common_1.ForbiddenException('User is not a member of this tenant');
        }
        if (!tenantUser.role.isActive || !tenantUser.isActive) {
            throw new common_1.ForbiddenException('User or Role is inactive in this tenant');
        }
        const rolePermissions = tenantUser.role.permissions.map(p => p.permission.slug);
        const overridePermissions = Array.isArray(tenantUser.permissions) ? tenantUser.permissions : [];
        const allPermissions = new Set([...rolePermissions, ...overridePermissions]);
        if (tenantUser.role.slug === 'superadmin') {
            return true;
        }
        const hasPermission = requiredPermissions.some(permission => allPermissions.has(permission));
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector, prisma_1.PrismaService])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map