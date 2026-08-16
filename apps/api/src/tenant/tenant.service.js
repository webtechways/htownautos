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
var TenantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = exports.INVITATION_STATUS = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_1 = require("@htownautos/prisma");
const auth_1 = require("@htownautos/auth");
const email_service_1 = require("../email/email.service");
const twilio_service_1 = require("../twilio/twilio.service");
const tenant_email_domain_service_1 = require("./tenant-email-domain.service");
const notifications_service_1 = require("../notifications/notifications.service");
const phone_number_dto_1 = require("./dto/phone-number.dto");
const fee_config_default_1 = require("./fee-config.default");
exports.INVITATION_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    REMOVED: 'removed',
};
let TenantService = TenantService_1 = class TenantService {
    prisma;
    clerkService;
    emailService;
    twilioService;
    tenantEmailDomainService;
    notificationsService;
    logger = new common_1.Logger(TenantService_1.name);
    constructor(prisma, clerkService, emailService, twilioService, tenantEmailDomainService, notificationsService) {
        this.prisma = prisma;
        this.clerkService = clerkService;
        this.emailService = emailService;
        this.twilioService = twilioService;
        this.tenantEmailDomainService = tenantEmailDomainService;
        this.notificationsService = notificationsService;
    }
    async create(createTenantDto, creatorUserId, ownerUsername) {
        const existingSlug = await this.prisma.tenant.findUnique({
            where: { slug: createTenantDto.slug },
        });
        if (existingSlug) {
            throw new common_1.ConflictException(`Tenant with slug '${createTenantDto.slug}' already exists`);
        }
        const existingSubdomain = await this.prisma.tenant.findUnique({
            where: { subdomain: createTenantDto.subdomain },
        });
        if (existingSubdomain) {
            throw new common_1.ConflictException(`Subdomain '${createTenantDto.subdomain}' is already taken`);
        }
        const creatorUser = await this.prisma.user.findUnique({
            where: { id: creatorUserId },
        });
        if (!creatorUser) {
            throw new common_1.NotFoundException(`User with ID '${creatorUserId}' not found`);
        }
        let ownerRole = await this.prisma.role.findFirst({
            where: {
                slug: 'owner',
                tenantId: null,
            },
        });
        if (!ownerRole) {
            ownerRole = await this.prisma.role.create({
                data: {
                    name: 'Owner',
                    slug: 'owner',
                    description: 'Tenant owner with full access',
                    isSystem: true,
                    tenantId: null,
                },
            });
        }
        const tenant = await this.prisma.$transaction(async (tx) => {
            const newTenant = await tx.tenant.create({
                data: createTenantDto,
            });
            const tenantEmail = `${ownerUsername}@${newTenant.subdomain}.htownautos.com`;
            await tx.tenantUser.create({
                data: {
                    tenantId: newTenant.id,
                    userId: creatorUserId,
                    roleId: ownerRole.id,
                    username: ownerUsername,
                    tenantEmail,
                    status: 'active',
                    isActive: true,
                    acceptedAt: new Date(),
                },
            });
            return newTenant;
        });
        try {
            await this.tenantEmailDomainService.provision(tenant.id);
        }
        catch (error) {
            this.logger.error(`Failed to provision email domain for tenant ${tenant.id}; will retry lazily`, error?.stack);
        }
        try {
            const org = await this.clerkService.createOrganization({
                name: tenant.name,
                createdBy: creatorUser.clerkUserId,
                publicMetadata: {
                    tenantId: tenant.id,
                    slug: tenant.slug,
                    businessName: tenant.businessName || tenant.name,
                },
            });
            await this.prisma.tenant.update({
                where: { id: tenant.id },
                data: { clerkOrgId: org.id },
            });
        }
        catch (error) {
            this.logger.error(`Failed to create Clerk organization for tenant ${tenant.id}:`, error);
        }
        const record = await this.prisma.tenant.findUnique({
            where: { id: tenant.id },
            include: {
                users: {
                    where: { userId: creatorUserId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        role: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });
        return record;
    }
    async findAll(query) {
        const { search, city, state, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { businessName: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (city) {
            where.city = { contains: city, mode: 'insensitive' };
        }
        if (state) {
            where.state = { equals: state, mode: 'insensitive' };
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.tenant.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.tenant.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        if (!tenant || tenant.deletedAt) {
            throw new common_1.NotFoundException(`Tenant with ID '${id}' not found`);
        }
        return tenant;
    }
    async findByIdOrClerkOrgId(id) {
        let tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant) {
            tenant = await this.prisma.tenant.findFirst({ where: { clerkOrgId: id } });
        }
        if (!tenant || tenant.deletedAt) {
            throw new common_1.NotFoundException(`Tenant with ID '${id}' not found`);
        }
        return tenant;
    }
    async findBySlug(slug) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
        });
        if (!tenant || tenant.deletedAt) {
            throw new common_1.NotFoundException(`Tenant with slug '${slug}' not found`);
        }
        return tenant;
    }
    async findOneWithStats(id) {
        const tenant = await this.findOne(id);
        const [userCount, vehicleCount, dealCount, buyerCount] = await Promise.all([
            this.prisma.tenantUser.count({ where: { tenantId: id } }),
            this.prisma.vehicle.count({ where: { tenantId: id } }),
            this.prisma.deal.count({ where: { tenantId: id } }),
            this.prisma.buyer.count({ where: { tenantId: id } }),
        ]);
        return {
            ...tenant,
            userCount,
            vehicleCount,
            dealCount,
            buyerCount,
        };
    }
    async update(id, updateTenantDto) {
        await this.findOne(id);
        if (updateTenantDto.slug) {
            const existingSlug = await this.prisma.tenant.findFirst({
                where: {
                    slug: updateTenantDto.slug,
                    id: { not: id },
                },
            });
            if (existingSlug) {
                throw new common_1.ConflictException(`Tenant with slug '${updateTenantDto.slug}' already exists`);
            }
        }
        delete updateTenantDto.slug;
        delete updateTenantDto.subdomain;
        if (updateTenantDto.subdomain) {
            const existingSubdomain = await this.prisma.tenant.findFirst({
                where: {
                    subdomain: updateTenantDto.subdomain,
                    id: { not: id },
                },
            });
            if (existingSubdomain) {
                throw new common_1.ConflictException(`Subdomain '${updateTenantDto.subdomain}' is already taken`);
            }
        }
        const updatedTenant = await this.prisma.tenant.update({
            where: { id },
            data: updateTenantDto,
        });
        if (updateTenantDto.subdomain) {
            const tenantUsers = await this.prisma.tenantUser.findMany({
                where: { tenantId: id },
                select: { id: true, username: true },
            });
            for (const tu of tenantUsers) {
                await this.prisma.tenantUser.update({
                    where: { id: tu.id },
                    data: {
                        tenantEmail: `${tu.username}@${updateTenantDto.subdomain}.htownautos.com`,
                    },
                });
            }
        }
        return updatedTenant;
    }
    async updateSettings(id, settings) {
        const tenant = await this.findOne(id);
        const mergedSettings = {
            ...(tenant.settings || {}),
            ...settings,
        };
        return this.prisma.tenant.update({
            where: { id },
            data: { settings: mergedSettings },
        });
    }
    async activate(id) {
        await this.findOne(id);
        return this.prisma.tenant.update({
            where: { id },
            data: { isActive: true },
        });
    }
    async deactivate(id) {
        await this.findOne(id);
        return this.prisma.tenant.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async remove(id, requestingUserId) {
        const tenant = await this.findByIdOrClerkOrgId(id);
        await this.verifyOwnership(tenant.id, requestingUserId);
        if (tenant.deletedAt) {
            throw new common_1.BadRequestException(`Tenant '${tenant.name}' has already been deleted`);
        }
        const now = new Date();
        await this.tenantEmailDomainService.deprovision(tenant.id);
        await this.prisma.$transaction([
            this.prisma.tenant.update({
                where: { id: tenant.id },
                data: {
                    deletedAt: now,
                    isActive: false,
                },
            }),
            this.prisma.tenantUser.updateMany({
                where: { tenantId: tenant.id },
                data: {
                    status: exports.INVITATION_STATUS.REMOVED,
                    isActive: false,
                    removedAt: now,
                },
            }),
            this.prisma.tenantInvitation.updateMany({
                where: { tenantId: tenant.id, status: exports.INVITATION_STATUS.PENDING },
                data: {
                    status: 'revoked',
                },
            }),
        ]);
        if (tenant.clerkOrgId) {
            try {
                await this.clerkService.deleteOrganization(tenant.clerkOrgId);
            }
            catch (error) {
                this.logger.error(`Failed to delete Clerk organization ${tenant.clerkOrgId}:`, error);
            }
        }
        return {
            message: `Business '${tenant.name}' has been successfully deleted`,
        };
    }
    async getUsers(id, roleSlugs) {
        await this.findOne(id);
        const where = {
            tenantId: id,
            status: { in: [exports.INVITATION_STATUS.ACTIVE, exports.INVITATION_STATUS.PENDING] },
        };
        if (roleSlugs && roleSlugs.length > 0) {
            where.role = {
                slug: { in: roleSlugs },
            };
        }
        return this.prisma.tenantUser.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        isActive: true,
                        lastLoginAt: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: [
                { status: 'asc' },
                { user: { email: 'asc' } },
            ],
        });
    }
    async getPhoneNumbers(id) {
        await this.findOne(id);
        return this.prisma.twilioPhoneNumber.findMany({
            where: { tenantId: id },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'asc' },
            ],
        });
    }
    async checkSlugAvailability(slug) {
        const existing = await this.prisma.tenant.findUnique({
            where: { slug },
        });
        return { available: !existing };
    }
    async checkSubdomainAvailability(subdomain) {
        const existing = await this.prisma.tenant.findUnique({
            where: { subdomain },
        });
        return { available: !existing };
    }
    async checkUsernameAvailability(tenantId, username) {
        const existing = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_username: { tenantId, username },
            },
        });
        return { available: !existing };
    }
    async getUserTenants(userId) {
        const tenantUsers = await this.prisma.tenantUser.findMany({
            where: {
                userId,
                isActive: true,
                status: exports.INVITATION_STATUS.ACTIVE,
                tenant: {
                    deletedAt: null,
                },
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        subdomain: true,
                        businessName: true,
                        logo: true,
                        address: true,
                        city: true,
                        state: true,
                        isActive: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                tenant: {
                    name: 'asc',
                },
            },
        });
        return tenantUsers.map((tu) => ({
            id: tu.tenant.id,
            name: tu.tenant.name,
            slug: tu.tenant.slug,
            subdomain: tu.tenant.subdomain,
            businessName: tu.tenant.businessName,
            logo: tu.tenant.logo,
            address: tu.tenant.address,
            city: tu.tenant.city,
            state: tu.tenant.state,
            isActive: tu.tenant.isActive,
            role: tu.role,
            isOwner: tu.role.slug === 'owner',
        }));
    }
    async verifyUserTenantAccess(userId, tenantId) {
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId, userId },
            },
        });
        return !!(tenantUser?.isActive && tenantUser?.status === exports.INVITATION_STATUS.ACTIVE);
    }
    async isOwner(tenantId, userId) {
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            include: {
                role: true,
            },
        });
        return tenantUser?.role?.slug === 'owner';
    }
    async verifyOwnership(tenantId, requestingUserId) {
        this.logger.log(`verifyOwnership: tenantId=${tenantId}, userId=${requestingUserId}`);
        const isOwner = await this.isOwner(tenantId, requestingUserId);
        this.logger.log(`verifyOwnership: isOwner=${isOwner}`);
        if (!isOwner) {
            const tenantUsers = await this.prisma.tenantUser.findMany({
                where: { tenantId },
                include: { role: true, user: { select: { id: true, email: true } } },
            });
            this.logger.warn(`verifyOwnership failed. Tenant users: ${JSON.stringify(tenantUsers.map(tu => ({ userId: tu.userId, email: tu.user.email, role: tu.role?.slug, status: tu.status })))}`);
            throw new common_1.ForbiddenException('Only the tenant owner can perform this action');
        }
    }
    async addUserToTenant(tenantId, addUserDto, requestingUserId) {
        await this.findOne(tenantId);
        await this.verifyOwnership(tenantId, requestingUserId);
        const user = await this.prisma.user.findUnique({
            where: { id: addUserDto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID '${addUserDto.userId}' not found`);
        }
        const role = await this.prisma.role.findFirst({
            where: {
                id: addUserDto.roleId,
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
            },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID '${addUserDto.roleId}' not found or not available for this tenant`);
        }
        if (role.slug === 'owner') {
            throw new common_1.BadRequestException('Cannot assign owner role. Each tenant can only have one owner.');
        }
        const existingTenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId, userId: addUserDto.userId },
            },
        });
        if (existingTenantUser) {
            throw new common_1.ConflictException(`User is already a member of this tenant`);
        }
        const existingUsername = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_username: { tenantId, username: addUserDto.username },
            },
        });
        if (existingUsername) {
            throw new common_1.ConflictException(`Username '${addUserDto.username}' is already taken in this tenant`);
        }
        const tenantForSubdomain = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { subdomain: true },
        });
        if (!tenantForSubdomain?.subdomain) {
            throw new common_1.BadRequestException('Tenant subdomain is not configured');
        }
        const tenantEmail = `${addUserDto.username}@${tenantForSubdomain.subdomain}.htownautos.com`;
        const record = await this.prisma.tenantUser.create({
            data: {
                tenantId,
                userId: addUserDto.userId,
                roleId: addUserDto.roleId,
                username: addUserDto.username,
                tenantEmail,
                permissions: addUserDto.permissions || undefined,
                isActive: addUserDto.isActive ?? true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
        return record;
    }
    async updateTenantUser(tenantId, userId, updateDto, requestingUserId) {
        await this.findOne(tenantId);
        await this.verifyOwnership(tenantId, requestingUserId);
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            include: { role: true },
        });
        if (!tenantUser) {
            throw new common_1.NotFoundException(`User is not a member of this tenant`);
        }
        if (tenantUser.role.slug === 'owner') {
            const allowedFieldsForOwner = ['extension'];
            const requestedFields = Object.keys(updateDto).filter((key) => updateDto[key] !== undefined);
            const disallowedFields = requestedFields.filter((field) => !allowedFieldsForOwner.includes(field));
            if (disallowedFields.length > 0) {
                throw new common_1.BadRequestException(`Cannot modify the tenant owner (only extension can be updated)`);
            }
            const ownerRecord = await this.prisma.tenantUser.update({
                where: {
                    tenantId_userId: { tenantId, userId },
                },
                data: {
                    extension: updateDto.extension,
                },
                include: {
                    user: true,
                    role: true,
                },
            });
            return ownerRecord;
        }
        if (updateDto.roleId) {
            const role = await this.prisma.role.findFirst({
                where: {
                    id: updateDto.roleId,
                    OR: [
                        { tenantId: tenantId },
                        { tenantId: null },
                    ],
                },
            });
            if (!role) {
                throw new common_1.NotFoundException(`Role with ID '${updateDto.roleId}' not found or not available for this tenant`);
            }
            if (role.slug === 'owner') {
                throw new common_1.BadRequestException('Cannot assign owner role');
            }
        }
        let updateData = { ...updateDto };
        if (updateDto.username) {
            const existingUsername = await this.prisma.tenantUser.findFirst({
                where: {
                    tenantId,
                    username: updateDto.username,
                    userId: { not: userId },
                },
            });
            if (existingUsername) {
                throw new common_1.ConflictException(`Username '${updateDto.username}' is already taken in this tenant`);
            }
            const tenantForSubdomain = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
                select: { subdomain: true },
            });
            if (!tenantForSubdomain?.subdomain) {
                throw new common_1.BadRequestException('Tenant subdomain is not configured');
            }
            updateData.tenantEmail = `${updateDto.username}@${tenantForSubdomain.subdomain}.htownautos.com`;
        }
        const record = await this.prisma.tenantUser.update({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
        return record;
    }
    async removeUserFromTenant(tenantId, userId, requestingUserId) {
        const tenant = await this.findOne(tenantId);
        await this.verifyOwnership(tenantId, requestingUserId);
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            include: { role: true, user: true },
        });
        if (!tenantUser) {
            throw new common_1.NotFoundException(`User is not a member of this tenant`);
        }
        if (tenantUser.role.slug === 'owner') {
            throw new common_1.BadRequestException('Cannot remove the tenant owner. Transfer ownership first.');
        }
        await this.prisma.tenantUser.update({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            data: {
                status: exports.INVITATION_STATUS.REMOVED,
                isActive: false,
                removedAt: new Date(),
            },
        });
        return {
            message: `User '${tenantUser.user.email}' has been removed from tenant '${tenant.name}'`,
        };
    }
    async transferOwnership(tenantId, newOwnerId, requestingUserId) {
        await this.findOne(tenantId);
        await this.verifyOwnership(tenantId, requestingUserId);
        const newOwnerTenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId, userId: newOwnerId },
            },
        });
        if (!newOwnerTenantUser) {
            throw new common_1.BadRequestException('New owner must be an existing member of the tenant');
        }
        if (newOwnerTenantUser.status !== exports.INVITATION_STATUS.ACTIVE) {
            throw new common_1.BadRequestException('New owner must have an active membership. Pending or suspended users cannot become owners.');
        }
        if (!newOwnerTenantUser.isActive) {
            throw new common_1.BadRequestException('New owner must be an active member. Disabled users cannot become owners.');
        }
        const ownerRole = await this.prisma.role.findFirst({
            where: {
                slug: 'owner',
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
            },
        });
        if (!ownerRole) {
            throw new common_1.NotFoundException('Owner role not found. Please contact support.');
        }
        const defaultRole = await this.prisma.role.findFirst({
            where: {
                slug: { in: ['admin', 'manager'] },
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
            },
        });
        if (!defaultRole) {
            throw new common_1.NotFoundException('No suitable role found for previous owner. Please contact support.');
        }
        await this.prisma.$transaction([
            this.prisma.tenantUser.update({
                where: {
                    tenantId_userId: { tenantId, userId: requestingUserId },
                },
                data: { roleId: defaultRole.id },
            }),
            this.prisma.tenantUser.update({
                where: {
                    tenantId_userId: { tenantId, userId: newOwnerId },
                },
                data: { roleId: ownerRole.id },
            }),
        ]);
        return {
            message: 'Ownership transferred successfully',
            previousOwnerId: requestingUserId,
            newOwnerId: newOwnerId,
        };
    }
    async getAvailableRoles(tenantId) {
        await this.findOne(tenantId);
        const roles = await this.prisma.role.findMany({
            where: {
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                isSystem: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return roles;
    }
    generateInvitationCode() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    async inviteUserToTenant(tenantId, inviteDto, requestingUserId) {
        const tenant = await this.findOne(tenantId);
        await this.verifyOwnership(tenantId, requestingUserId);
        const role = await this.prisma.role.findFirst({
            where: {
                id: inviteDto.roleId,
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
            },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID '${inviteDto.roleId}' not found or not available for this tenant`);
        }
        if (role.slug === 'owner') {
            throw new common_1.BadRequestException('Cannot invite as owner. Each tenant can only have one owner.');
        }
        const existingUsername = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_username: { tenantId, username: inviteDto.username },
            },
        });
        if (existingUsername) {
            throw new common_1.ConflictException(`Username '${inviteDto.username}' is already taken in this tenant`);
        }
        const tenantEmail = `${inviteDto.username}@${tenant.subdomain}.htownautos.com`;
        let user = await this.prisma.user.findUnique({
            where: { email: inviteDto.email.toLowerCase() },
        });
        if (user) {
            const existingTenantUser = await this.prisma.tenantUser.findUnique({
                where: {
                    tenantId_userId: { tenantId, userId: user.id },
                },
            });
            if (existingTenantUser) {
                if (existingTenantUser.status === exports.INVITATION_STATUS.REMOVED) {
                    const invitationCode = this.generateInvitationCode();
                    const INVITATION_EXPIRY_DAYS = 7;
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);
                    const reactivatedTenantUser = await this.prisma.tenantUser.update({
                        where: { id: existingTenantUser.id },
                        data: {
                            roleId: inviteDto.roleId,
                            username: inviteDto.username,
                            tenantEmail,
                            permissions: inviteDto.permissions || undefined,
                            status: exports.INVITATION_STATUS.PENDING,
                            isActive: false,
                            invitationCode,
                            invitationSentAt: new Date(),
                            invitedBy: requestingUserId,
                            removedAt: null,
                            acceptedAt: null,
                        },
                        include: {
                            role: { select: { id: true, name: true, slug: true } },
                        },
                    });
                    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/accept-invitation?code=${invitationCode}`;
                    console.log('\n========================================');
                    console.log('📧 RE-INVITATION SENT (Previously Removed User)');
                    console.log('========================================');
                    console.log(`To: ${user.email}`);
                    console.log(`Tenant: ${tenant.name}`);
                    console.log(`Role: ${role.name}`);
                    console.log(`Expires: ${expiresAt.toLocaleDateString()} (${INVITATION_EXPIRY_DAYS} days)`);
                    console.log(`Invitation URL: ${invitationUrl}`);
                    console.log('========================================\n');
                    const ownerTenantUser = await this.prisma.tenantUser.findFirst({
                        where: {
                            tenantId,
                            role: { slug: 'owner' },
                        },
                        select: { tenantEmail: true },
                    });
                    await this.emailService.sendInvitationEmail({
                        to: user.email,
                        tenantName: tenant.name,
                        ownerEmail: ownerTenantUser?.tenantEmail || `notify@${tenant.subdomain}.htownautos.com`,
                        roleName: role.name,
                        invitationUrl,
                        expiresAt,
                    });
                    return {
                        message: `Re-invitation sent to ${user.email}`,
                        invitation: {
                            id: reactivatedTenantUser.id,
                            email: user.email,
                            status: exports.INVITATION_STATUS.PENDING,
                            invitationSentAt: reactivatedTenantUser.invitationSentAt,
                            role: reactivatedTenantUser.role,
                        },
                        user: {
                            id: user.id,
                            email: user.email,
                        },
                        _debug: {
                            invitationCode,
                            invitationUrl,
                        },
                    };
                }
                if (existingTenantUser.status === exports.INVITATION_STATUS.PENDING) {
                    throw new common_1.ConflictException('User already has a pending invitation to this tenant.');
                }
                if (existingTenantUser.status === exports.INVITATION_STATUS.SUSPENDED) {
                    throw new common_1.ConflictException('This user is suspended from this tenant.');
                }
                throw new common_1.ConflictException('User is already a member of this tenant');
            }
        }
        const existingInvitation = await this.prisma.tenantInvitation.findUnique({
            where: {
                tenantId_email: { tenantId, email: inviteDto.email.toLowerCase() },
            },
        });
        if (existingInvitation && existingInvitation.status === 'pending') {
            throw new common_1.ConflictException('An invitation has already been sent to this email. Use resend invitation instead.');
        }
        const invitationCode = this.generateInvitationCode();
        const INVITATION_EXPIRY_DAYS = 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);
        const isExistingUser = !!(user && user.clerkUserId);
        const result = await this.prisma.$transaction(async (tx) => {
            if (!user) {
                user = await tx.user.create({
                    data: {
                        email: inviteDto.email.toLowerCase(),
                        clerkUserId: null,
                        isActive: true,
                        emailVerified: false,
                    },
                });
                this.logger.log(`Created pending user with ID: ${user.id} for email: ${inviteDto.email}`);
            }
            else {
                this.logger.log(`Reusing existing user with ID: ${user.id} for email: ${inviteDto.email}`);
            }
            const tenantUser = await tx.tenantUser.create({
                data: {
                    tenantId,
                    userId: user.id,
                    roleId: inviteDto.roleId,
                    username: inviteDto.username,
                    tenantEmail,
                    permissions: inviteDto.permissions || undefined,
                    status: exports.INVITATION_STATUS.PENDING,
                    isActive: false,
                    invitationCode,
                    invitationSentAt: new Date(),
                    invitedBy: requestingUserId,
                },
            });
            const invitation = await tx.tenantInvitation.upsert({
                where: {
                    tenantId_email: { tenantId, email: inviteDto.email.toLowerCase() },
                },
                update: {
                    roleId: inviteDto.roleId,
                    permissions: inviteDto.permissions || undefined,
                    invitationCode,
                    invitationSentAt: new Date(),
                    expiresAt,
                    invitedBy: requestingUserId,
                    status: 'pending',
                    acceptedAt: null,
                },
                create: {
                    tenantId,
                    email: inviteDto.email.toLowerCase(),
                    roleId: inviteDto.roleId,
                    permissions: inviteDto.permissions || undefined,
                    invitationCode,
                    expiresAt,
                    invitedBy: requestingUserId,
                    status: 'pending',
                },
                include: {
                    role: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            });
            return { user: user, tenantUser, invitation };
        });
        if (isExistingUser && result.user) {
            try {
                const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/me/invitations`;
                const activeMemberships = await this.prisma.tenantUser.findMany({
                    where: {
                        userId: result.user.id,
                        status: exports.INVITATION_STATUS.ACTIVE,
                        isActive: true,
                        tenant: { deletedAt: null },
                    },
                    select: { tenantId: true },
                });
                for (const membership of activeMemberships) {
                    await this.notificationsService.create(membership.tenantId, result.user.id, {
                        title: 'New tenant invitation',
                        message: `You have been invited to join ${tenant.name}`,
                        type: 'TENANT_INVITATION',
                        actionUrl: invitationUrl,
                        priority: 'normal',
                    });
                }
            }
            catch (notifErr) {
                this.logger.warn(`Failed to send invitation notification to user ${result.user.id}: ${notifErr.message}`);
            }
        }
        const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/accept-invitation?code=${invitationCode}`;
        console.log('\n========================================');
        console.log('📧 INVITATION SENT');
        console.log('========================================');
        console.log(`To: ${inviteDto.email}`);
        console.log(`Tenant: ${tenant.name}`);
        console.log(`Role: ${role.name}`);
        console.log(`User ID: ${result.user.id}`);
        console.log(`TenantUser Status: ${exports.INVITATION_STATUS.PENDING}`);
        console.log(`Expires: ${expiresAt.toLocaleDateString()} (${INVITATION_EXPIRY_DAYS} days)`);
        console.log(`Invitation URL: ${invitationUrl}`);
        console.log('========================================\n');
        const ownerTenantUser = await this.prisma.tenantUser.findFirst({
            where: {
                tenantId,
                role: { slug: 'owner' },
            },
            select: { tenantEmail: true },
        });
        await this.emailService.sendInvitationEmail({
            to: inviteDto.email,
            tenantName: tenant.name,
            ownerEmail: ownerTenantUser?.tenantEmail || `notify@${tenant.subdomain}.htownautos.com`,
            roleName: role.name,
            invitationUrl,
            expiresAt,
        });
        return {
            message: `Invitation sent to ${inviteDto.email}`,
            invitation: {
                id: result.invitation.id,
                email: result.invitation.email,
                status: result.invitation.status,
                invitationSentAt: result.invitation.invitationSentAt,
                role: result.invitation.role,
            },
            user: {
                id: result.user.id,
                email: result.user.email,
            },
            _debug: {
                invitationCode,
                invitationUrl,
            },
        };
    }
    async getInvitationByCode(code) {
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: { invitationCode: code },
            include: {
                tenant: { select: { id: true, name: true, slug: true } },
                user: { select: { id: true, email: true, name: true, clerkUserId: true } },
                role: { select: { id: true, name: true, slug: true } },
            },
        });
        if (tenantUser) {
            if (tenantUser.status === exports.INVITATION_STATUS.ACTIVE) {
                throw new common_1.BadRequestException('This invitation has already been accepted');
            }
            if (tenantUser.status === exports.INVITATION_STATUS.SUSPENDED) {
                throw new common_1.GoneException('This invitation has been revoked');
            }
            const requiresRegistration = !tenantUser.user.clerkUserId;
            return {
                type: 'tenantUser',
                id: tenantUser.id,
                email: tenantUser.user.email,
                tenant: tenantUser.tenant,
                role: tenantUser.role,
                userExists: true,
                requiresRegistration,
            };
        }
        const invitation = await this.prisma.tenantInvitation.findUnique({
            where: { invitationCode: code },
            include: {
                tenant: {
                    select: { id: true, name: true, slug: true },
                },
                role: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
        if (invitation) {
            if (invitation.status === 'accepted') {
                throw new common_1.BadRequestException('This invitation has already been accepted');
            }
            if (invitation.status === 'revoked') {
                throw new common_1.GoneException('This invitation has been revoked');
            }
            if (invitation.expiresAt && new Date() > invitation.expiresAt) {
                throw new common_1.GoneException('This invitation has expired');
            }
            const user = await this.prisma.user.findUnique({
                where: { email: invitation.email },
            });
            return {
                type: 'invitation',
                id: invitation.id,
                email: invitation.email,
                tenant: invitation.tenant,
                role: invitation.role,
                userExists: !!user,
                requiresRegistration: !user || !user.clerkUserId,
            };
        }
        throw new common_1.NotFoundException('Invalid or expired invitation code');
    }
    async acceptInvitation(code, loggedInUser) {
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: { invitationCode: code },
            include: {
                tenant: true,
                user: true,
                role: { select: { id: true, name: true, slug: true } },
            },
        });
        if (!tenantUser) {
            throw new common_1.NotFoundException('Invalid or expired invitation code');
        }
        if (tenantUser.status === exports.INVITATION_STATUS.ACTIVE) {
            throw new common_1.BadRequestException('This invitation has already been accepted');
        }
        if (tenantUser.status === exports.INVITATION_STATUS.SUSPENDED) {
            throw new common_1.GoneException('This invitation has been revoked');
        }
        const emailMatches = tenantUser.user.email.toLowerCase() === loggedInUser.email.toLowerCase();
        const ownerMatches = tenantUser.userId === loggedInUser.id;
        if (!emailMatches && !ownerMatches) {
            throw new common_1.ForbiddenException('This invitation was sent to a different email address');
        }
        const realUserId = loggedInUser.id;
        const orphanedUserId = tenantUser.userId !== realUserId && !tenantUser.user.clerkUserId
            ? tenantUser.userId
            : null;
        if (orphanedUserId) {
            const alreadyMember = await this.prisma.tenantUser.findUnique({
                where: { tenantId_userId: { tenantId: tenantUser.tenantId, userId: realUserId } },
            });
            if (alreadyMember) {
                throw new common_1.ConflictException('You are already a member of this tenant');
            }
        }
        const updatedTenantUser = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.tenantUser.update({
                where: { id: tenantUser.id },
                data: {
                    userId: realUserId,
                    status: exports.INVITATION_STATUS.ACTIVE,
                    isActive: true,
                    acceptedAt: new Date(),
                    invitationCode: null,
                },
                include: {
                    tenant: { select: { id: true, name: true, slug: true, clerkOrgId: true } },
                    user: { select: { id: true, email: true, name: true } },
                    role: { select: { id: true, name: true, slug: true } },
                },
            });
            if (orphanedUserId) {
                const otherMemberships = await tx.tenantUser.count({
                    where: { userId: orphanedUserId },
                });
                if (otherMemberships === 0) {
                    await tx.user.delete({ where: { id: orphanedUserId } });
                    this.logger.log(`Deleted orphaned placeholder user ${orphanedUserId}`);
                }
            }
            await tx.tenantInvitation.updateMany({
                where: {
                    tenantId: tenantUser.tenantId,
                    email: tenantUser.user.email.toLowerCase(),
                    status: 'pending',
                },
                data: { status: 'accepted', acceptedAt: new Date() },
            });
            return updated;
        });
        if (updatedTenantUser.tenant.clerkOrgId) {
            try {
                const clerkRole = this.mapRoleToClerkRole(updatedTenantUser.role.slug);
                await this.clerkService.addOrganizationMembership(updatedTenantUser.tenant.clerkOrgId, loggedInUser.clerkUserId, clerkRole);
            }
            catch (clerkErr) {
                this.logger.error(`Failed to add Clerk membership for user ${loggedInUser.clerkUserId} in org ${updatedTenantUser.tenant.clerkOrgId}: ${clerkErr.message}`);
            }
        }
        this.logger.log(`Invitation accepted for ${loggedInUser.email} in tenant ${updatedTenantUser.tenant.name}`);
        return {
            message: `Welcome to ${updatedTenantUser.tenant.name}!`,
            tenantUser: {
                id: updatedTenantUser.id,
                status: updatedTenantUser.status,
                acceptedAt: updatedTenantUser.acceptedAt,
                tenant: updatedTenantUser.tenant,
                user: updatedTenantUser.user,
                role: updatedTenantUser.role,
            },
        };
    }
    mapRoleToClerkRole(roleSlug) {
        if (roleSlug === 'owner' || roleSlug === 'admin')
            return 'org:admin';
        return 'org:member';
    }
    async getMyInvitations(userId, email) {
        const tenantUsers = await this.prisma.tenantUser.findMany({
            where: {
                status: exports.INVITATION_STATUS.PENDING,
                OR: [
                    { userId },
                    { user: { email: { equals: email, mode: 'insensitive' } } },
                ],
                tenant: { deletedAt: null },
            },
            include: {
                tenant: { select: { id: true, name: true, slug: true } },
                role: { select: { id: true, name: true, slug: true } },
                user: { select: { id: true, email: true } },
            },
            orderBy: { invitationSentAt: 'desc' },
        });
        const inviterIds = [...new Set(tenantUsers.map((tu) => tu.invitedBy).filter(Boolean))];
        const inviters = inviterIds.length
            ? await this.prisma.user.findMany({
                where: { id: { in: inviterIds } },
                select: { id: true, email: true, name: true, firstName: true, lastName: true },
            })
            : [];
        const inviterMap = new Map(inviters.map((u) => [u.id, u]));
        return tenantUsers.map((tu) => {
            const inviter = tu.invitedBy ? inviterMap.get(tu.invitedBy) : null;
            return {
                id: tu.id,
                tenantId: tu.tenant.id,
                tenantName: tu.tenant.name,
                roleName: tu.role.name,
                roleSlug: tu.role.slug,
                invitedBy: inviter
                    ? { id: inviter.id, name: inviter.name || `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim() || inviter.email }
                    : null,
                invitedAt: tu.invitationSentAt,
                invitationCode: tu.invitationCode,
            };
        });
    }
    async acceptMyInvitation(tenantUserId, loggedInUser) {
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: { id: tenantUserId },
            include: {
                tenant: true,
                user: true,
                role: { select: { id: true, name: true, slug: true } },
            },
        });
        if (!tenantUser) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (tenantUser.status === exports.INVITATION_STATUS.ACTIVE) {
            throw new common_1.BadRequestException('This invitation has already been accepted');
        }
        if (tenantUser.status !== exports.INVITATION_STATUS.PENDING) {
            throw new common_1.BadRequestException('This invitation is no longer pending');
        }
        const emailMatches = tenantUser.user.email.toLowerCase() === loggedInUser.email.toLowerCase();
        const ownerMatches = tenantUser.userId === loggedInUser.id;
        if (!emailMatches && !ownerMatches) {
            throw new common_1.ForbiddenException('This invitation does not belong to you');
        }
        const orphanedUserId = tenantUser.userId !== loggedInUser.id && !tenantUser.user.clerkUserId
            ? tenantUser.userId
            : null;
        if (orphanedUserId) {
            const alreadyMember = await this.prisma.tenantUser.findUnique({
                where: { tenantId_userId: { tenantId: tenantUser.tenantId, userId: loggedInUser.id } },
            });
            if (alreadyMember) {
                throw new common_1.ConflictException('You are already a member of this tenant');
            }
        }
        const updatedTenantUser = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.tenantUser.update({
                where: { id: tenantUser.id },
                data: {
                    userId: loggedInUser.id,
                    status: exports.INVITATION_STATUS.ACTIVE,
                    isActive: true,
                    acceptedAt: new Date(),
                    invitationCode: null,
                },
                include: {
                    tenant: { select: { id: true, name: true, slug: true, clerkOrgId: true } },
                    user: { select: { id: true, email: true, name: true } },
                    role: { select: { id: true, name: true, slug: true } },
                },
            });
            if (orphanedUserId) {
                const otherMemberships = await tx.tenantUser.count({
                    where: { userId: orphanedUserId },
                });
                if (otherMemberships === 0) {
                    await tx.user.delete({ where: { id: orphanedUserId } });
                    this.logger.log(`Deleted orphaned placeholder user ${orphanedUserId}`);
                }
            }
            await tx.tenantInvitation.updateMany({
                where: {
                    tenantId: tenantUser.tenantId,
                    email: tenantUser.user.email.toLowerCase(),
                    status: 'pending',
                },
                data: { status: 'accepted', acceptedAt: new Date() },
            });
            return updated;
        });
        if (updatedTenantUser.tenant.clerkOrgId) {
            try {
                const clerkRole = this.mapRoleToClerkRole(updatedTenantUser.role.slug);
                await this.clerkService.addOrganizationMembership(updatedTenantUser.tenant.clerkOrgId, loggedInUser.clerkUserId, clerkRole);
            }
            catch (clerkErr) {
                this.logger.error(`Failed to add Clerk membership for user ${loggedInUser.clerkUserId}: ${clerkErr.message}`);
            }
        }
        this.logger.log(`In-app invitation accepted for ${loggedInUser.email} in tenant ${updatedTenantUser.tenant.name}`);
        return {
            message: `Welcome to ${updatedTenantUser.tenant.name}!`,
            tenantUser: {
                id: updatedTenantUser.id,
                status: updatedTenantUser.status,
                acceptedAt: updatedTenantUser.acceptedAt,
                tenant: updatedTenantUser.tenant,
                user: updatedTenantUser.user,
                role: updatedTenantUser.role,
            },
        };
    }
    async declineMyInvitation(tenantUserId, loggedInUser) {
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: { id: tenantUserId },
            include: { user: { select: { id: true, email: true } } },
        });
        if (!tenantUser) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (tenantUser.status !== exports.INVITATION_STATUS.PENDING) {
            throw new common_1.BadRequestException('This invitation is no longer pending');
        }
        const emailMatches = tenantUser.user.email.toLowerCase() === loggedInUser.email.toLowerCase();
        const ownerMatches = tenantUser.userId === loggedInUser.id;
        if (!emailMatches && !ownerMatches) {
            throw new common_1.ForbiddenException('This invitation does not belong to you');
        }
        await this.prisma.tenantUser.update({
            where: { id: tenantUser.id },
            data: {
                status: 'declined',
                isActive: false,
                invitationCode: null,
            },
        });
        return { ok: true };
    }
    async registerAndAcceptInvitation(registerDto) {
        const { code, email, password, firstName, lastName } = registerDto;
        this.logger.log('========================================');
        this.logger.log('REGISTERING NEW USER VIA INVITATION');
        this.logger.log('========================================');
        this.logger.log(`Email: ${email}`);
        this.logger.log(`Name: ${firstName} ${lastName}`);
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: { invitationCode: code },
            include: {
                tenant: true,
                user: true,
                role: { select: { id: true, name: true, slug: true } },
            },
        });
        if (!tenantUser) {
            throw new common_1.NotFoundException('Invalid invitation code');
        }
        if (tenantUser.status === exports.INVITATION_STATUS.ACTIVE) {
            throw new common_1.BadRequestException('This invitation has already been accepted');
        }
        if (tenantUser.status === exports.INVITATION_STATUS.SUSPENDED) {
            throw new common_1.GoneException('This invitation has been revoked');
        }
        if (email.toLowerCase() !== tenantUser.user.email.toLowerCase()) {
            throw new common_1.BadRequestException('Email does not match the invitation. Please use the email the invitation was sent to.');
        }
        if (tenantUser.user.clerkUserId) {
            throw new common_1.ConflictException('This user already has an account. Please log in to accept the invitation.');
        }
        const clerkResult = await this.clerkService.createUser({
            email,
            password,
            firstName,
            lastName,
        });
        this.logger.log(`Clerk user created with ID: ${clerkResult.clerkUserId}`);
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: tenantUser.user.id },
                data: {
                    clerkUserId: clerkResult.clerkUserId,
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`,
                    emailVerified: true,
                    isActive: true,
                },
            });
            this.logger.log(`User updated in database with ID: ${updatedUser.id}`);
            const updatedTenantUser = await tx.tenantUser.update({
                where: { id: tenantUser.id },
                data: {
                    status: exports.INVITATION_STATUS.ACTIVE,
                    isActive: true,
                    acceptedAt: new Date(),
                    invitationCode: null,
                },
                include: {
                    tenant: { select: { id: true, name: true, slug: true } },
                    user: { select: { id: true, email: true, name: true, firstName: true, lastName: true } },
                    role: { select: { id: true, name: true, slug: true } },
                },
            });
            await tx.tenantInvitation.updateMany({
                where: {
                    tenantId: tenantUser.tenantId,
                    email: tenantUser.user.email,
                    status: 'pending',
                },
                data: {
                    status: 'accepted',
                    acceptedAt: new Date(),
                },
            });
            return { user: updatedUser, tenantUser: updatedTenantUser };
        });
        this.logger.log('========================================');
        this.logger.log('REGISTRATION COMPLETE');
        this.logger.log(`User ID: ${result.user.id}`);
        this.logger.log(`Tenant: ${result.tenantUser.tenant.name}`);
        this.logger.log(`Role: ${result.tenantUser.role.name}`);
        this.logger.log('========================================');
        return {
            message: `Account created! Welcome to ${result.tenantUser.tenant.name}!`,
            user: {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
            },
            tenantUser: {
                id: result.tenantUser.id,
                status: result.tenantUser.status,
                acceptedAt: result.tenantUser.acceptedAt,
                tenant: result.tenantUser.tenant,
                role: result.tenantUser.role,
            },
        };
    }
    async resendInvitation(tenantId, userId, requestingUserId) {
        const tenant = await this.findOne(tenantId);
        await this.verifyOwnership(tenantId, requestingUserId);
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            include: {
                user: true,
                role: true,
            },
        });
        if (!tenantUser) {
            throw new common_1.NotFoundException('User is not a member of this tenant');
        }
        if (tenantUser.status === exports.INVITATION_STATUS.ACTIVE) {
            throw new common_1.BadRequestException('User has already accepted the invitation');
        }
        const invitationCode = this.generateInvitationCode();
        const INVITATION_EXPIRY_DAYS = 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);
        const updatedTenantUser = await this.prisma.tenantUser.update({
            where: { id: tenantUser.id },
            data: {
                invitationCode,
                invitationSentAt: new Date(),
                status: exports.INVITATION_STATUS.PENDING,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
        const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/accept-invitation?code=${invitationCode}`;
        console.log('\n========================================');
        console.log('📧 INVITATION RESENT');
        console.log('========================================');
        console.log(`To: ${updatedTenantUser.user.email}`);
        console.log(`Tenant: ${tenant.name}`);
        console.log(`Role: ${tenantUser.role.name}`);
        console.log(`Expires: ${expiresAt.toLocaleDateString()} (${INVITATION_EXPIRY_DAYS} days)`);
        console.log(`Invitation URL: ${invitationUrl}`);
        console.log('========================================\n');
        const ownerTenantUser = await this.prisma.tenantUser.findFirst({
            where: {
                tenantId,
                role: { slug: 'owner' },
            },
            select: { tenantEmail: true },
        });
        await this.emailService.sendInvitationEmail({
            to: updatedTenantUser.user.email,
            tenantName: tenant.name,
            ownerEmail: ownerTenantUser?.tenantEmail || `notify@${tenant.subdomain}.htownautos.com`,
            roleName: tenantUser.role.name,
            invitationUrl,
            expiresAt,
        });
        return {
            message: `Invitation resent to ${updatedTenantUser.user.email}`,
            invitationSentAt: updatedTenantUser.invitationSentAt,
            _debug: {
                invitationCode,
                invitationUrl,
            },
        };
    }
    async revokeInvitation(tenantId, userId, requestingUserId) {
        await this.findOne(tenantId);
        await this.verifyOwnership(tenantId, requestingUserId);
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            include: {
                user: true,
            },
        });
        if (!tenantUser) {
            throw new common_1.NotFoundException('User is not a member of this tenant');
        }
        if (tenantUser.status === exports.INVITATION_STATUS.ACTIVE) {
            throw new common_1.BadRequestException('Cannot revoke invitation for an active user. Use remove user instead.');
        }
        await this.prisma.tenantUser.delete({
            where: { id: tenantUser.id },
        });
        return {
            message: `Invitation for ${tenantUser.user.email} has been revoked`,
        };
    }
    async getPendingInvitations(tenantId, requestingUserId) {
        await this.findOne(tenantId);
        await this.verifyOwnership(tenantId, requestingUserId);
        return this.prisma.tenantUser.findMany({
            where: {
                tenantId,
                status: exports.INVITATION_STATUS.PENDING,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                invitationSentAt: 'desc',
            },
        });
    }
    async searchAvailablePhoneNumbers(type, value) {
        if (type === phone_number_dto_1.SearchType.TOLL_FREE) {
            return this.twilioService.searchTollFree();
        }
        else if (type === phone_number_dto_1.SearchType.STATE && value) {
            return this.twilioService.searchByState(value);
        }
        else if (type === phone_number_dto_1.SearchType.AREA_CODE && value) {
            return this.twilioService.searchByAreaCode(value);
        }
        else {
            throw new common_1.BadRequestException('Invalid search type or missing value');
        }
    }
    async purchasePhoneNumber(tenantId, dto) {
        const tenant = await this.findOne(tenantId);
        const tenantDomain = tenant.subdomain || tenant.slug;
        const friendlyName = dto.friendlyName || `${tenantDomain}.htownautos.com`;
        const phoneId = (0, crypto_1.randomUUID)();
        const purchased = await this.twilioService.purchaseNumber(dto.phoneNumber, friendlyName, tenantId, phoneId, tenant.twilioMessagingServiceSid || undefined);
        if (dto.isPrimary) {
            await this.prisma.twilioPhoneNumber.updateMany({
                where: { tenantId, isPrimary: true },
                data: { isPrimary: false },
            });
        }
        const record = await this.prisma.twilioPhoneNumber.create({
            data: {
                id: phoneId,
                tenantId,
                phoneNumber: purchased.phoneNumber,
                twilioSid: purchased.sid,
                friendlyName,
                canVoice: purchased.capabilities.voice,
                canSms: purchased.capabilities.sms,
                canMms: purchased.capabilities.mms,
                isPrimary: dto.isPrimary || false,
                isActive: true,
            },
        });
        return record;
    }
    async updatePhoneNumber(tenantId, phoneNumberId, dto) {
        const phoneNumber = await this.prisma.twilioPhoneNumber.findFirst({
            where: { id: phoneNumberId, tenantId },
        });
        if (!phoneNumber) {
            throw new common_1.NotFoundException('Phone number not found');
        }
        if (dto.friendlyName && dto.friendlyName !== phoneNumber.friendlyName) {
            await this.twilioService.updateNumber(phoneNumber.twilioSid, {
                friendlyName: dto.friendlyName,
            });
        }
        if (dto.isPrimary) {
            await this.prisma.twilioPhoneNumber.updateMany({
                where: { tenantId, isPrimary: true, id: { not: phoneNumberId } },
                data: { isPrimary: false },
            });
        }
        const record = await this.prisma.twilioPhoneNumber.update({
            where: { id: phoneNumberId },
            data: {
                friendlyName: dto.friendlyName,
                isPrimary: dto.isPrimary,
                isActive: dto.isActive,
            },
        });
        return record;
    }
    async deletePhoneNumber(tenantId, phoneNumberId) {
        const phoneNumber = await this.prisma.twilioPhoneNumber.findFirst({
            where: { id: phoneNumberId, tenantId },
        });
        if (!phoneNumber) {
            throw new common_1.NotFoundException('Phone number not found');
        }
        await this.twilioService.releaseNumber(phoneNumber.twilioSid);
        await this.prisma.twilioPhoneNumber.delete({
            where: { id: phoneNumberId },
        });
        return { message: 'Phone number released successfully' };
    }
    async getFeeConfig(tenantId, requestingUserId) {
        const tenant = await this.findOne(tenantId);
        const hasAccess = await this.verifyUserTenantAccess(requestingUserId, tenantId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this tenant');
        }
        if (tenant.feeConfig) {
            return tenant.feeConfig;
        }
        return fee_config_default_1.DEFAULT_FEE_CONFIG;
    }
    async updateFeeConfig(tenantId, requestingUserId, config) {
        await this.findOne(tenantId);
        const hasAccess = await this.verifyUserTenantAccess(requestingUserId, tenantId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this tenant');
        }
        const updated = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { feeConfig: config },
            select: { feeConfig: true },
        });
        return updated.feeConfig;
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = TenantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        auth_1.ClerkService,
        email_service_1.EmailService,
        twilio_service_1.TwilioService,
        tenant_email_domain_service_1.TenantEmailDomainService,
        notifications_service_1.NotificationsService])
], TenantService);
//# sourceMappingURL=tenant.service.js.map