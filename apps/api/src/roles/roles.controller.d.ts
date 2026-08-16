import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto, tenantId: string): Promise<{
        permissions: ({
            permission: {
                id: string;
                slug: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                action: string;
                resource: string;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        description: string | null;
        isSystem: boolean;
    }>;
    findAll(tenantId: string): Promise<({
        permissions: ({
            permission: {
                id: string;
                slug: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                action: string;
                resource: string;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        description: string | null;
        isSystem: boolean;
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        permissions: ({
            permission: {
                id: string;
                slug: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                action: string;
                resource: string;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        description: string | null;
        isSystem: boolean;
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto, tenantId: string): Promise<{
        permissions: ({
            permission: {
                id: string;
                slug: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                action: string;
                resource: string;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        description: string | null;
        isSystem: boolean;
    }>;
    remove(id: string, tenantId: string): Promise<{
        name: string;
        id: string;
        slug: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        description: string | null;
        isSystem: boolean;
    }>;
}
