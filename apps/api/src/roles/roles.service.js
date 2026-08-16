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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async create(createRoleDto, tenantId) {
        const { name, description, permissions, slug } = createRoleDto;
        const finalSlug = slug ? this.generateSlug(slug) : this.generateSlug(name);
        const existingRole = await this.prisma.role.findUnique({
            where: {
                tenantId_slug: {
                    tenantId: tenantId,
                    slug: finalSlug,
                },
            },
        });
        if (existingRole) {
            throw new common_1.BadRequestException(`Role with slug '${finalSlug}' already exists in this dealership.`);
        }
        const validPermissions = await this.prisma.permission.findMany({
            where: {
                slug: { in: permissions },
            },
        });
        if (validPermissions.length !== permissions.length) {
            const foundSlugs = validPermissions.map(p => p.slug);
            const invalidSlugs = permissions.filter(p => !foundSlugs.includes(p));
            throw new common_1.BadRequestException(`Invalid permissions: ${invalidSlugs.join(', ')}`);
        }
        const role = await this.prisma.role.create({
            data: {
                name,
                slug: finalSlug,
                description,
                tenantId,
                isSystem: false,
                permissions: {
                    create: validPermissions.map(p => ({
                        permissionId: p.id,
                    })),
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        return role;
    }
    async findAll(tenantId) {
        return this.prisma.role.findMany({
            where: {
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    async findOne(id, tenantId) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        if (role.tenantId && role.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied to this role');
        }
        return role;
    }
    async update(id, updateRoleDto, tenantId) {
        const role = await this.findOne(id, tenantId);
        if (role.isSystem) {
            throw new common_1.ForbiddenException('Cannot modify system roles.');
        }
        if (!role.tenantId || role.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Cannot modify global/system roles or roles from another tenant.');
        }
        const { permissions, ...data } = updateRoleDto;
        if (permissions) {
            const validPermissions = await this.prisma.permission.findMany({
                where: {
                    slug: { in: permissions },
                },
            });
            await this.prisma.rolePermission.deleteMany({
                where: { roleId: id },
            });
            await this.prisma.rolePermission.createMany({
                data: validPermissions.map(p => ({
                    roleId: id,
                    permissionId: p.id
                }))
            });
        }
        const record = await this.prisma.role.update({
            where: { id },
            data: {
                ...data,
            },
            include: {
                permissions: {
                    include: { permission: true }
                }
            }
        });
        return record;
    }
    async remove(id, tenantId) {
        const role = await this.findOne(id, tenantId);
        if (role.isSystem) {
            throw new common_1.ForbiddenException('Cannot delete system roles.');
        }
        if (!role.tenantId || role.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Cannot delete global roles.');
        }
        const userCount = await this.prisma.tenantUser.count({
            where: { roleId: id }
        });
        if (userCount > 0) {
            throw new common_1.BadRequestException('Cannot delete role that is assigned to users. Reassign them first.');
        }
        const record = await this.prisma.role.delete({
            where: { id },
        });
        return record;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map