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
var TenantGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantGuard = exports.TENANT_ERROR_CODE = exports.TENANT_OPTIONAL_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
exports.TENANT_OPTIONAL_KEY = 'tenantOptional';
exports.TENANT_ERROR_CODE = 'TENANT_REQUIRED';
let TenantGuard = TenantGuard_1 = class TenantGuard {
    reflector;
    prisma;
    logger = new common_1.Logger(TenantGuard_1.name);
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const isTenantOptional = this.reflector.getAllAndOverride(exports.TENANT_OPTIONAL_KEY, [context.getHandler(), context.getClass()]);
        if (isTenantOptional) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            return true;
        }
        if (request.apiKey && request.tenant) {
            return true;
        }
        const clerkOrgId = request.clerkOrgId;
        const legacyTenantId = request.headers['x-tenant-id'];
        let tenant = null;
        if (clerkOrgId) {
            tenant = await this.prisma.$queryRawUnsafe(`SELECT * FROM tenants WHERE clerk_org_id = $1 LIMIT 1`, clerkOrgId).then((rows) => rows[0] || null);
        }
        else if (legacyTenantId) {
            tenant = await this.prisma.tenant.findUnique({
                where: { id: legacyTenantId },
            });
        }
        if (!tenant) {
            throw new common_1.ForbiddenException({
                message: 'Tenant ID is required. Please select a business.',
                error: 'Forbidden',
                statusCode: 403,
                code: exports.TENANT_ERROR_CODE,
            });
        }
        if (!tenant.isActive) {
            throw new common_1.ForbiddenException({
                message: 'This business is currently inactive.',
                error: 'Forbidden',
                statusCode: 403,
                code: exports.TENANT_ERROR_CODE,
            });
        }
        let tenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId: tenant.id, userId: user.id },
            },
        });
        if ((!tenantUser || !tenantUser.isActive) && clerkOrgId) {
            tenantUser = await this.autoProvisionMembership(tenant.id, user.id, request.clerkOrgRole);
        }
        if (!tenantUser || !tenantUser.isActive || tenantUser.status !== 'active') {
            throw new common_1.ForbiddenException({
                message: 'You do not have access to this business.',
                error: 'Forbidden',
                statusCode: 403,
                code: exports.TENANT_ERROR_CODE,
            });
        }
        request.tenant = tenant;
        request.tenantUser = tenantUser;
        return true;
    }
    async autoProvisionMembership(tenantId, userId, clerkOrgRole) {
        try {
            const roleSlug = clerkOrgRole === 'org:admin' ? 'owner' : 'salesperson';
            const role = (await this.prisma.role.findFirst({ where: { slug: roleSlug, tenantId } })) ||
                (await this.prisma.role.findFirst({ where: { slug: roleSlug, tenantId: null } }));
            if (!role) {
                this.logger.warn(`Auto-provision skipped: role "${roleSlug}" not found for tenant ${tenantId}`);
                return null;
            }
            const existing = await this.prisma.tenantUser.findUnique({
                where: { tenantId_userId: { tenantId, userId } },
            });
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
                select: { subdomain: true },
            });
            const userRow = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, firstName: true, lastName: true },
            });
            if (existing) {
                const patchIdentity = !existing.username || !existing.tenantEmail
                    ? await (0, common_2.resolveTenantUserIdentity)(this.prisma, tenantId, userRow || {}, tenant?.subdomain, existing.id)
                    : null;
                const updated = await this.prisma.tenantUser.update({
                    where: { id: existing.id },
                    data: {
                        status: 'active',
                        isActive: true,
                        roleId: role.id,
                        acceptedAt: new Date(),
                        ...(patchIdentity
                            ? {
                                username: existing.username || patchIdentity.username,
                                tenantEmail: existing.tenantEmail || patchIdentity.tenantEmail,
                            }
                            : {}),
                    },
                });
                this.logger.log(`Auto-reactivated TenantUser ${userId} in tenant ${tenantId}`);
                return updated;
            }
            const identity = await (0, common_2.resolveTenantUserIdentity)(this.prisma, tenantId, userRow || {}, tenant?.subdomain);
            const created = await this.prisma.tenantUser.create({
                data: {
                    tenantId,
                    userId,
                    roleId: role.id,
                    status: 'active',
                    isActive: true,
                    acceptedAt: new Date(),
                    username: identity.username,
                    tenantEmail: identity.tenantEmail,
                },
            });
            this.logger.log(`Auto-provisioned TenantUser ${userId} in tenant ${tenantId} as ${roleSlug} (${identity.tenantEmail || identity.username})`);
            return created;
        }
        catch (err) {
            this.logger.error(`Auto-provision failed for user ${userId} tenant ${tenantId}: ${err.message}`);
            return null;
        }
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = TenantGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_1.PrismaService])
], TenantGuard);
//# sourceMappingURL=tenant.guard.js.map