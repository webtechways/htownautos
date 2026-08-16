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
exports.InvitationController = exports.TenantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_service_1 = require("./tenant.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const update_tenant_dto_1 = require("./dto/update-tenant.dto");
const query_tenant_dto_1 = require("./dto/query-tenant.dto");
const add_user_to_tenant_dto_1 = require("./dto/add-user-to-tenant.dto");
const phone_number_dto_1 = require("./dto/phone-number.dto");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
const tenant_entity_1 = require("./entities/tenant.entity");
const auth_3 = require("@htownautos/auth");
const auth_4 = require("@htownautos/auth");
const auth_5 = require("@htownautos/auth");
let TenantController = class TenantController {
    tenantService;
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    getMyTenants(user) {
        return this.tenantService.getUserTenants(user.id);
    }
    create(createTenantDto, user) {
        const { ownerUsername, ...tenantData } = createTenantDto;
        return this.tenantService.create(tenantData, user.id, ownerUsername);
    }
    findAll(query) {
        return this.tenantService.findAll(query);
    }
    checkSlugAvailability(slug) {
        return this.tenantService.checkSlugAvailability(slug);
    }
    checkSubdomainAvailability(subdomain) {
        return this.tenantService.checkSubdomainAvailability(subdomain);
    }
    checkUsernameAvailability(id, username) {
        return this.tenantService.checkUsernameAvailability(id, username);
    }
    findBySlug(slug) {
        return this.tenantService.findBySlug(slug);
    }
    findOne(id) {
        return this.tenantService.findOne(id);
    }
    findOneWithStats(id) {
        return this.tenantService.findOneWithStats(id);
    }
    getUsers(id, roles) {
        const roleSlugs = roles ? roles.split(',').map((r) => r.trim()) : undefined;
        return this.tenantService.getUsers(id, roleSlugs);
    }
    getStaff(id, roles) {
        const roleSlugs = roles ? roles.split(',').map((r) => r.trim()) : undefined;
        return this.tenantService.getUsers(id, roleSlugs);
    }
    getPhoneNumbers(id) {
        return this.tenantService.getPhoneNumbers(id);
    }
    searchAvailablePhoneNumbers(id, query) {
        const searchType = query.numberType === 'tollFree' ? phone_number_dto_1.SearchType.TOLL_FREE : query.type;
        return this.tenantService.searchAvailablePhoneNumbers(searchType, query.value);
    }
    purchasePhoneNumber(id, dto) {
        return this.tenantService.purchasePhoneNumber(id, dto);
    }
    updatePhoneNumber(id, phoneNumberId, dto) {
        return this.tenantService.updatePhoneNumber(id, phoneNumberId, dto);
    }
    deletePhoneNumber(id, phoneNumberId) {
        return this.tenantService.deletePhoneNumber(id, phoneNumberId);
    }
    getAvailableRoles(id) {
        return this.tenantService.getAvailableRoles(id);
    }
    update(id, updateTenantDto) {
        return this.tenantService.update(id, updateTenantDto);
    }
    updateSettings(id, settings) {
        return this.tenantService.updateSettings(id, settings);
    }
    activate(id) {
        return this.tenantService.activate(id);
    }
    deactivate(id) {
        return this.tenantService.deactivate(id);
    }
    remove(id, user) {
        return this.tenantService.remove(id, user.id);
    }
    addUserToTenant(tenantId, addUserDto, user) {
        return this.tenantService.addUserToTenant(tenantId, addUserDto, user.id);
    }
    updateTenantUser(tenantId, userId, updateDto, user) {
        return this.tenantService.updateTenantUser(tenantId, userId, updateDto, user.id);
    }
    removeUserFromTenant(tenantId, userId, user) {
        return this.tenantService.removeUserFromTenant(tenantId, userId, user.id);
    }
    transferOwnership(tenantId, newOwnerId, user) {
        return this.tenantService.transferOwnership(tenantId, newOwnerId, user.id);
    }
    getMyInvitations(user) {
        return this.tenantService.getMyInvitations(user.id, user.email);
    }
    acceptMyInvitation(tenantUserId, user) {
        return this.tenantService.acceptMyInvitation(tenantUserId, user);
    }
    declineMyInvitation(tenantUserId, user) {
        return this.tenantService.declineMyInvitation(tenantUserId, user);
    }
    inviteUserToTenant(tenantId, inviteDto, user) {
        return this.tenantService.inviteUserToTenant(tenantId, inviteDto, user.id);
    }
    resendInvitation(tenantId, resendDto, user) {
        return this.tenantService.resendInvitation(tenantId, resendDto.userId, user.id);
    }
    revokeInvitation(tenantId, userId, user) {
        return this.tenantService.revokeInvitation(tenantId, userId, user.id);
    }
    getPendingInvitations(tenantId, user) {
        return this.tenantService.getPendingInvitations(tenantId, user.id);
    }
    getFeeConfig(id, user) {
        return this.tenantService.getFeeConfig(id, user.id);
    }
    updateFeeConfig(id, dto, user) {
        return this.tenantService.updateFeeConfig(id, user.id, dto);
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Get)('my-tenants'),
    (0, auth_2.TenantOptional)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user tenants',
        description: 'Returns all tenants the authenticated user belongs to',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user tenants',
    }),
    __param(0, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "getMyTenants", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_2.TenantOptional)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new tenant',
        description: 'Creates a new tenant (dealership) in the system. The authenticated user becomes the owner of the tenant.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Tenant created successfully with the current user as owner',
        type: tenant_entity_1.TenantEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation error',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Tenant with this slug already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all tenants',
        description: 'Retrieves a paginated list of tenants with optional filters',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of tenants',
        type: tenant_entity_1.PaginatedTenantsEntity,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_tenant_dto_1.QueryTenantDto]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('check-slug/:slug'),
    (0, auth_2.TenantOptional)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Check slug availability',
        description: 'Checks if a slug is available for use',
    }),
    (0, swagger_1.ApiParam)({
        name: 'slug',
        description: 'Slug to check',
        example: 'htown-autos-houston',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability status',
        schema: {
            type: 'object',
            properties: {
                available: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "checkSlugAvailability", null);
__decorate([
    (0, common_1.Get)('check-subdomain/:subdomain'),
    (0, auth_2.TenantOptional)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Check subdomain availability',
        description: 'Checks if a subdomain is available for use',
    }),
    (0, swagger_1.ApiParam)({
        name: 'subdomain',
        description: 'Subdomain to check',
        example: 'houston',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability status',
        schema: {
            type: 'object',
            properties: {
                available: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('subdomain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "checkSubdomainAvailability", null);
__decorate([
    (0, common_1.Get)(':id/check-username/:username'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check username availability in tenant',
        description: 'Checks if a username is available within a specific tenant',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'username',
        description: 'Username to check',
        example: 'john.doe',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability status',
        schema: {
            type: 'object',
            properties: {
                available: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "checkUsernameAvailability", null);
__decorate([
    (0, common_1.Get)('by-slug/:slug'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tenant by slug',
        description: 'Retrieves a tenant by its URL-friendly slug',
    }),
    (0, swagger_1.ApiParam)({
        name: 'slug',
        description: 'Tenant slug',
        example: 'htown-autos-houston',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant found',
        type: tenant_entity_1.TenantEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tenant by ID',
        description: 'Retrieves a tenant by its UUID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant found',
        type: tenant_entity_1.TenantEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tenant with statistics',
        description: 'Retrieves a tenant with counts of users, vehicles, deals, and buyers',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant with statistics',
        type: tenant_entity_1.TenantWithStatsEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "findOneWithStats", null);
__decorate([
    (0, common_1.Get)(':id/users'),
    (0, common_1.UseGuards)(auth_5.RolesGuard),
    (0, auth_4.RequireRoles)(...auth_4.ADMIN_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tenant users',
        description: 'Retrieves all users associated with a tenant, optionally filtered by role slugs. Requires admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'roles',
        required: false,
        description: 'Comma-separated list of role slugs to filter by (e.g., "owner,salesperson")',
        example: 'owner,salesperson,bdc',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of tenant users',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('roles')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(':id/staff'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tenant staff for assignment',
        description: 'Retrieves active staff members for task/lead assignment. Any tenant member can access this endpoint.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'roles',
        required: false,
        description: 'Comma-separated list of role slugs to filter by (e.g., "salesperson,bdc")',
        example: 'salesperson,bdc',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of active staff members',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('roles')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "getStaff", null);
__decorate([
    (0, common_1.Get)(':id/phone-numbers'),
    (0, common_1.UseGuards)(auth_5.RolesGuard),
    (0, auth_4.RequireRoles)(...auth_4.ADMIN_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tenant phone numbers',
        description: 'Retrieves all Twilio phone numbers for the tenant. Requires admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of phone numbers',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "getPhoneNumbers", null);
__decorate([
    (0, common_1.Get)(':id/phone-numbers/available'),
    (0, common_1.UseGuards)(auth_5.RolesGuard),
    (0, auth_4.RequireRoles)(...auth_4.ADMIN_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Search available phone numbers',
        description: 'Search for available Twilio phone numbers by state, area code, or toll-free. Requires admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        description: 'Search type: state, areaCode, or tollFree',
        example: 'state',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'value',
        description: 'State code (e.g., TX) or area code (e.g., 713). Not required for toll-free.',
        example: 'TX',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'numberType',
        description: 'Type of number: local or tollFree',
        example: 'local',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of available phone numbers',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, phone_number_dto_1.SearchPhoneNumbersDto]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "searchAvailablePhoneNumbers", null);
__decorate([
    (0, common_1.Post)(':id/phone-numbers'),
    (0, common_1.UseGuards)(auth_5.RolesGuard),
    (0, auth_4.RequireRoles)(...auth_4.ADMIN_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Purchase and add a phone number',
        description: 'Purchases a phone number from Twilio and adds it to the tenant. Requires admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Phone number purchased and added successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid phone number or Twilio error',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant or user not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'User already has a phone number assigned',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, phone_number_dto_1.PurchasePhoneNumberDto]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "purchasePhoneNumber", null);
__decorate([
    (0, common_1.Patch)(':id/phone-numbers/:phoneNumberId'),
    (0, common_1.UseGuards)(auth_5.RolesGuard),
    (0, auth_4.RequireRoles)(...auth_4.ADMIN_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a phone number',
        description: 'Updates phone number settings including assignment. Requires admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'phoneNumberId',
        description: 'Phone number UUID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Phone number updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Phone number not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('phoneNumberId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, phone_number_dto_1.UpdatePhoneNumberDto]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "updatePhoneNumber", null);
__decorate([
    (0, common_1.Delete)(':id/phone-numbers/:phoneNumberId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(auth_5.RolesGuard),
    (0, auth_4.RequireRoles)(...auth_4.ADMIN_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a phone number',
        description: 'Releases a phone number back to Twilio and removes it from the tenant. Requires admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'phoneNumberId',
        description: 'Phone number UUID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Phone number released successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Phone number not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('phoneNumberId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "deletePhoneNumber", null);
__decorate([
    (0, common_1.Get)(':id/roles'),
    (0, common_1.UseGuards)(auth_5.RolesGuard),
    (0, auth_4.RequireRoles)(...auth_4.ADMIN_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available roles for tenant',
        description: 'Retrieves all roles available for this tenant (global + tenant-specific). Used for invitation role selection. Requires admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of available roles',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "getAvailableRoles", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update tenant',
        description: 'Updates a tenant by its UUID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant updated successfully',
        type: tenant_entity_1.TenantEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Slug already in use',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tenant_dto_1.UpdateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/settings'),
    (0, common_1.UseGuards)(auth_5.RolesGuard),
    (0, auth_4.RequireRoles)(...auth_4.ADMIN_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Update tenant settings',
        description: 'Updates tenant settings (merges with existing settings). Requires admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settings updated successfully',
        type: tenant_entity_1.TenantEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Activate tenant',
        description: 'Sets tenant status to active',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant activated',
        type: tenant_entity_1.TenantEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate tenant',
        description: 'Sets tenant status to inactive (soft disable)',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant deactivated',
        type: tenant_entity_1.TenantEntity,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_2.TenantOptional)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete tenant',
        description: 'Soft-deletes a tenant and deactivates all related users and invitations. Only the tenant owner can perform this action.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: "Tenant 'HTown Autos' has been successfully deleted" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Tenant has already been deleted',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the tenant owner can perform this action',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/users'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add user to tenant',
        description: 'Adds an existing user to a tenant with a specific role. Only the tenant owner can perform this action.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User added to tenant successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the tenant owner can perform this action',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant, user, or role not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'User is already a member of this tenant',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_user_to_tenant_dto_1.AddUserToTenantDto, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "addUserToTenant", null);
__decorate([
    (0, common_1.Patch)(':id/users/:userId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update tenant user',
        description: "Updates a user's role or permissions in a tenant. Only the tenant owner can perform this action.",
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User UUID to update',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant user updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot modify the tenant owner',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the tenant owner can perform this action',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant, user, or role not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, add_user_to_tenant_dto_1.UpdateTenantUserDto, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "updateTenantUser", null);
__decorate([
    (0, common_1.Delete)(':id/users/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove user from tenant',
        description: 'Removes a user from a tenant. Only the tenant owner can perform this action.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User UUID to remove',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User removed from tenant successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: "User 'john@example.com' has been removed from tenant 'HTown Autos'" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot remove the tenant owner',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the tenant owner can perform this action',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant or user not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(2, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "removeUserFromTenant", null);
__decorate([
    (0, common_1.Post)(':id/transfer-ownership'),
    (0, swagger_1.ApiOperation)({
        summary: 'Transfer tenant ownership',
        description: 'Transfers ownership of a tenant to another user. Only the current owner can perform this action.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ownership transferred successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Ownership transferred successfully' },
                previousOwnerId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
                newOwnerId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174002' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'New owner must be an existing member of the tenant',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the tenant owner can perform this action',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('newOwnerId', common_1.ParseUUIDPipe)),
    __param(2, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "transferOwnership", null);
__decorate([
    (0, common_1.Get)('me/invitations'),
    (0, auth_2.TenantOptional)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my pending invitations',
        description: 'Returns all pending tenant invitations for the logged-in user, ' +
            'regardless of which tenant they are currently in.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of pending invitations' }),
    __param(0, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "getMyInvitations", null);
__decorate([
    (0, common_1.Post)('me/invitations/:tenantUserId/accept'),
    (0, auth_2.TenantOptional)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Accept a pending invitation (in-app)',
        description: 'Accepts a pending tenant invitation identified by TenantUser ID. ' +
            'Adds the logged-in user to the tenant and syncs Clerk organization membership.',
    }),
    (0, swagger_1.ApiParam)({ name: 'tenantUserId', description: 'TenantUser UUID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invitation accepted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Invitation does not belong to you' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invitation not found' }),
    __param(0, (0, common_1.Param)('tenantUserId', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "acceptMyInvitation", null);
__decorate([
    (0, common_1.Post)('me/invitations/:tenantUserId/decline'),
    (0, auth_2.TenantOptional)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Decline a pending invitation (in-app)',
        description: 'Declines a pending tenant invitation identified by TenantUser ID.',
    }),
    (0, swagger_1.ApiParam)({ name: 'tenantUserId', description: 'TenantUser UUID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invitation declined' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Invitation does not belong to you' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invitation not found' }),
    __param(0, (0, common_1.Param)('tenantUserId', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "declineMyInvitation", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    (0, swagger_1.ApiOperation)({
        summary: 'Invite user to tenant',
        description: 'Invites a user to join a tenant. Sends an invitation email with a verification code. Only the tenant owner can perform this action.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Invitation sent successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invitation sent to john@example.com' },
                tenantUser: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        status: { type: 'string', example: 'pending' },
                        invitationSentAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the tenant owner can perform this action',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant, user, or role not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'User already has a pending invitation or is already a member',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_user_to_tenant_dto_1.InviteUserToTenantDto, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "inviteUserToTenant", null);
__decorate([
    (0, common_1.Post)(':id/invitations/resend'),
    (0, swagger_1.ApiOperation)({
        summary: 'Resend invitation',
        description: 'Resends the invitation email to a user with a new verification code. Only the tenant owner can perform this action.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation resent successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'User has already accepted the invitation',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the tenant owner can perform this action',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant or user not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_user_to_tenant_dto_1.ResendInvitationDto, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "resendInvitation", null);
__decorate([
    (0, common_1.Delete)(':id/invitations/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke invitation',
        description: 'Revokes a pending invitation. Only the tenant owner can perform this action.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'User UUID whose invitation to revoke',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation revoked successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invitation for john@example.com has been revoked' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot revoke invitation for an active user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the tenant owner can perform this action',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant or user not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(2, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "revokeInvitation", null);
__decorate([
    (0, common_1.Get)(':id/invitations/pending'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get pending invitations',
        description: 'Retrieves all pending invitations for a tenant. Only the tenant owner can view this.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of pending invitations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Only the tenant owner can perform this action',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Tenant not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "getPendingInvitations", null);
__decorate([
    (0, common_1.Get)(':id/fee-config'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tenant fee configuration',
        description: 'Returns the per-tenant auction fee configuration. ' +
            'Falls back to the system default if the tenant has not saved a custom config. ' +
            'Requires active membership in the tenant.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee configuration' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not a member of this tenant' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "getFeeConfig", null);
__decorate([
    (0, common_1.Patch)(':id/fee-config'),
    (0, common_1.UseGuards)(auth_5.RolesGuard),
    (0, auth_4.RequireRoles)(...auth_4.ADMIN_ROLES),
    (0, swagger_1.ApiOperation)({
        summary: 'Update tenant fee configuration',
        description: 'Saves a full fee configuration for the tenant. ' +
            'Requires admin role. The body must be the complete FeeConfig object.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Saved fee configuration' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not an admin of this tenant' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "updateFeeConfig", null);
exports.TenantController = TenantController = __decorate([
    (0, swagger_1.ApiTags)('Tenants'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], TenantController);
let InvitationController = class InvitationController {
    tenantService;
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    getInvitationDetails(code) {
        return this.tenantService.getInvitationByCode(code);
    }
    acceptInvitation(acceptDto, user) {
        return this.tenantService.acceptInvitation(acceptDto.code, user);
    }
    registerAndAcceptInvitation(registerDto) {
        return this.tenantService.registerAndAcceptInvitation(registerDto);
    }
};
exports.InvitationController = InvitationController;
__decorate([
    (0, common_1.Get)(':code'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get invitation details',
        description: 'Retrieves invitation details by code. Used to show invitation info before accepting.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'code',
        description: 'Invitation code',
        example: 'abc123xyz789',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation details',
        schema: {
            type: 'object',
            properties: {
                type: { type: 'string', example: 'invitation' },
                id: { type: 'string' },
                email: { type: 'string' },
                tenant: { type: 'object' },
                role: { type: 'object' },
                userExists: { type: 'boolean' },
                requiresRegistration: { type: 'boolean' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Invalid or expired invitation code',
    }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "getInvitationDetails", null);
__decorate([
    (0, common_1.Post)('accept'),
    (0, auth_2.TenantOptional)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Accept invitation',
        description: 'Accepts a tenant invitation using the secret code received via email. ' +
            'Caller must be authenticated — the logged-in user is added to the tenant.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation accepted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Welcome to HTown Autos!' },
                tenantUser: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        status: { type: 'string', example: 'active' },
                        acceptedAt: { type: 'string', format: 'date-time' },
                        tenant: { type: 'object' },
                        user: { type: 'object' },
                        role: { type: 'object' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invitation has already been accepted',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Must be authenticated to accept an invitation',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'This invitation was sent to a different email address',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Invalid or expired invitation code',
    }),
    (0, swagger_1.ApiResponse)({
        status: 410,
        description: 'Invitation has been revoked',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_3.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_user_to_tenant_dto_1.AcceptInvitationDto, Object]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Register and accept invitation',
        description: 'Creates a new user account and accepts the invitation in one step. ' +
            'Creates user in Clerk, creates user in database, and associates with tenant.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User registered and invitation accepted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Account created! Welcome to HTown Autos!' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                    },
                },
                tenantUser: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        status: { type: 'string', example: 'active' },
                        acceptedAt: { type: 'string', format: 'date-time' },
                        tenant: { type: 'object' },
                        role: { type: 'object' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Email does not match invitation or password requirements not met',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Invalid invitation code',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Account with this email already exists',
    }),
    (0, swagger_1.ApiResponse)({
        status: 410,
        description: 'Invitation has been revoked or expired',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_user_to_tenant_dto_1.RegisterWithInvitationDto]),
    __metadata("design:returntype", void 0)
], InvitationController.prototype, "registerAndAcceptInvitation", null);
exports.InvitationController = InvitationController = __decorate([
    (0, swagger_1.ApiTags)('Invitations'),
    (0, common_1.Controller)('invitations'),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], InvitationController);
//# sourceMappingURL=tenant.controller.js.map