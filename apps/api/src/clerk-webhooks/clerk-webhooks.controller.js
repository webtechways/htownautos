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
var ClerkWebhooksController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkWebhooksController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("@htownautos/auth");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
let ClerkWebhooksController = ClerkWebhooksController_1 = class ClerkWebhooksController {
    prisma;
    logger = new common_1.Logger(ClerkWebhooksController_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleWebhook(req) {
        const event = req.body;
        const eventType = event?.type;
        this.logger.log(`Received Clerk webhook: ${eventType}`);
        try {
            switch (eventType) {
                case 'organizationMembership.created':
                    await this.handleMembershipCreated(event.data);
                    break;
                case 'organizationMembership.updated':
                    await this.handleMembershipUpdated(event.data);
                    break;
                case 'organizationMembership.deleted':
                    await this.handleMembershipDeleted(event.data);
                    break;
                case 'organization.created':
                    await this.handleOrganizationCreated(event.data);
                    break;
                case 'organization.deleted':
                    await this.handleOrganizationDeleted(event.data);
                    break;
                default:
                    this.logger.debug(`Unhandled webhook event: ${eventType}`);
            }
        }
        catch (error) {
            this.logger.error(`Webhook processing failed for ${eventType}:`, error);
        }
        return { received: true };
    }
    async handleMembershipCreated(data) {
        const clerkOrgId = data.organization?.id;
        const clerkUserId = data.public_user_data?.user_id;
        const role = data.role;
        if (!clerkOrgId || !clerkUserId)
            return;
        const tenants = await this.prisma.$queryRawUnsafe(`SELECT id FROM tenants WHERE clerk_org_id = $1 LIMIT 1`, clerkOrgId);
        if (tenants.length === 0)
            return;
        const tenantId = tenants[0].id;
        const user = await this.prisma.user.findUnique({
            where: { clerkUserId },
        });
        if (!user) {
            this.logger.warn(`User not found for Clerk ID ${clerkUserId}`);
            return;
        }
        const roleSlug = role === 'org:admin' ? 'owner' : 'salesperson';
        const dbRole = await this.prisma.role.findFirst({
            where: { slug: roleSlug, tenantId },
        });
        if (!dbRole) {
            this.logger.warn(`Role ${roleSlug} not found for tenant ${tenantId}`);
            return;
        }
        const existing = await this.prisma.tenantUser.findUnique({
            where: { tenantId_userId: { tenantId, userId: user.id } },
        });
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { subdomain: true },
        });
        if (existing) {
            const patch = !existing.username || !existing.tenantEmail
                ? await (0, common_2.resolveTenantUserIdentity)(this.prisma, tenantId, { email: user.email, firstName: user.firstName, lastName: user.lastName }, tenant?.subdomain, existing.id)
                : null;
            await this.prisma.tenantUser.update({
                where: { id: existing.id },
                data: {
                    status: 'active',
                    isActive: true,
                    roleId: dbRole.id,
                    acceptedAt: new Date(),
                    ...(patch
                        ? {
                            username: existing.username || patch.username,
                            tenantEmail: existing.tenantEmail || patch.tenantEmail,
                        }
                        : {}),
                },
            });
            this.logger.log(`Reactivated membership: ${user.email} in tenant ${tenantId}`);
        }
        else {
            const identity = await (0, common_2.resolveTenantUserIdentity)(this.prisma, tenantId, { email: user.email, firstName: user.firstName, lastName: user.lastName }, tenant?.subdomain);
            await this.prisma.tenantUser.create({
                data: {
                    tenantId,
                    userId: user.id,
                    roleId: dbRole.id,
                    status: 'active',
                    isActive: true,
                    acceptedAt: new Date(),
                    username: identity.username,
                    tenantEmail: identity.tenantEmail,
                },
            });
            this.logger.log(`Created membership: ${user.email} in tenant ${tenantId} as ${identity.tenantEmail || identity.username}`);
        }
    }
    async handleMembershipUpdated(data) {
        const clerkOrgId = data.organization?.id;
        const clerkUserId = data.public_user_data?.user_id;
        const role = data.role;
        if (!clerkOrgId || !clerkUserId)
            return;
        const tenants = await this.prisma.$queryRawUnsafe(`SELECT id FROM tenants WHERE clerk_org_id = $1 LIMIT 1`, clerkOrgId);
        if (tenants.length === 0)
            return;
        const tenantId = tenants[0].id;
        const user = await this.prisma.user.findUnique({
            where: { clerkUserId },
        });
        if (!user)
            return;
        const roleSlug = role === 'org:admin' ? 'owner' : 'salesperson';
        const dbRole = await this.prisma.role.findFirst({
            where: { slug: roleSlug, tenantId },
        });
        if (!dbRole)
            return;
        await this.prisma.tenantUser.updateMany({
            where: { tenantId, userId: user.id },
            data: { roleId: dbRole.id },
        });
        this.logger.log(`Updated role for ${user.email} to ${roleSlug} in tenant ${tenantId}`);
    }
    async handleMembershipDeleted(data) {
        const clerkOrgId = data.organization?.id;
        const clerkUserId = data.public_user_data?.user_id;
        if (!clerkOrgId || !clerkUserId)
            return;
        const tenants = await this.prisma.$queryRawUnsafe(`SELECT id FROM tenants WHERE clerk_org_id = $1 LIMIT 1`, clerkOrgId);
        if (tenants.length === 0)
            return;
        const tenantId = tenants[0].id;
        const user = await this.prisma.user.findUnique({
            where: { clerkUserId },
        });
        if (!user)
            return;
        await this.prisma.tenantUser.updateMany({
            where: { tenantId, userId: user.id },
            data: { status: 'removed', isActive: false },
        });
        this.logger.log(`Removed membership: ${user.email} from tenant ${tenantId}`);
    }
    async handleOrganizationCreated(data) {
        const clerkOrgId = data.id;
        const name = data.name;
        const slug = data.slug || data.id;
        const createdBy = data.created_by;
        const meta = data.public_metadata || {};
        const existing = await this.prisma.$queryRawUnsafe(`SELECT id FROM tenants WHERE clerk_org_id = $1 LIMIT 1`, clerkOrgId);
        if (existing.length > 0) {
            this.logger.log(`Tenant already exists for Clerk org ${clerkOrgId}, skipping`);
            return;
        }
        const tenantRows = await this.prisma.$queryRawUnsafe(`INSERT INTO tenants (id, name, slug, clerk_org_id, "businessName", "isActive", "createdAt", "updatedAt", country)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, true, now(), now(), 'USA')
       RETURNING id`, name, slug, clerkOrgId, meta.businessName || name);
        const tenantId = tenantRows[0]?.id;
        this.logger.log(`Created tenant ${tenantId} for Clerk org: ${name} (${clerkOrgId})`);
        if (createdBy && tenantId) {
            const creator = await this.prisma.user.findUnique({
                where: { clerkUserId: createdBy },
            });
            if (creator) {
                const ownerRole = await this.prisma.role.findFirst({
                    where: { slug: 'owner', tenantId: null },
                });
                if (ownerRole) {
                    const tenantRow = await this.prisma.tenant.findUnique({
                        where: { id: tenantId },
                        select: { subdomain: true },
                    });
                    const identity = await (0, common_2.resolveTenantUserIdentity)(this.prisma, tenantId, { email: creator.email, firstName: creator.firstName, lastName: creator.lastName }, tenantRow?.subdomain);
                    await this.prisma.tenantUser.create({
                        data: {
                            tenantId,
                            userId: creator.id,
                            roleId: ownerRole.id,
                            status: 'active',
                            isActive: true,
                            acceptedAt: new Date(),
                            username: identity.username,
                            tenantEmail: identity.tenantEmail,
                        },
                    });
                    this.logger.log(`Linked creator ${creator.email} as owner of tenant ${tenantId} (${identity.tenantEmail || identity.username})`);
                }
            }
        }
        try {
            const { createClerkClient } = require('@clerk/backend');
            const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
            await clerk.organizations.updateOrganization(clerkOrgId, {
                publicMetadata: {
                    ...meta,
                    tenantId,
                    slug,
                    businessName: meta.businessName || name,
                },
            });
            this.logger.log(`Updated Clerk org ${clerkOrgId} metadata with tenantId ${tenantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update Clerk org metadata:`, error);
        }
    }
    async handleOrganizationDeleted(data) {
        const clerkOrgId = data.id;
        await this.prisma.$queryRawUnsafe(`UPDATE tenants SET "isActive" = false, "deletedAt" = now() WHERE clerk_org_id = $1`, clerkOrgId);
        this.logger.log(`Deactivated tenant for deleted Clerk org: ${clerkOrgId}`);
    }
};
exports.ClerkWebhooksController = ClerkWebhooksController;
__decorate([
    (0, auth_1.Public)(),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClerkWebhooksController.prototype, "handleWebhook", null);
exports.ClerkWebhooksController = ClerkWebhooksController = ClerkWebhooksController_1 = __decorate([
    (0, common_1.Controller)('clerk-webhooks'),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ClerkWebhooksController);
//# sourceMappingURL=clerk-webhooks.controller.js.map