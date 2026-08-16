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
exports.RegisterWithInvitationDto = exports.ResendInvitationDto = exports.AcceptInvitationDto = exports.UpdateTenantUserDto = exports.InviteUserToTenantDto = exports.AddUserToTenantDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AddUserToTenantDto {
    userId;
    username;
    roleId;
    permissions;
    isActive;
}
exports.AddUserToTenantDto = AddUserToTenantDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID to add to the tenant',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddUserToTenantDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Username for tenant email (username@subdomain.htownautos.com)',
        example: 'john.doe',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(30),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, {
        message: 'Username must be lowercase alphanumeric with dots, underscores, or hyphens only',
    }),
    __metadata("design:type", String)
], AddUserToTenantDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role ID to assign to the user in this tenant',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddUserToTenantDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom permissions/overrides for this user in this tenant',
        example: { canExportData: true, maxDealsPerDay: 10 },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AddUserToTenantDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the user is active in this tenant',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AddUserToTenantDto.prototype, "isActive", void 0);
class InviteUserToTenantDto {
    email;
    username;
    roleId;
    permissions;
}
exports.InviteUserToTenantDto = InviteUserToTenantDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email of the user to invite',
        example: 'john.doe@example.com',
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InviteUserToTenantDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Username for tenant email (username@subdomain.htownautos.com)',
        example: 'john.doe',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(30),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, {
        message: 'Username must be lowercase alphanumeric with dots, underscores, or hyphens only',
    }),
    __metadata("design:type", String)
], InviteUserToTenantDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role ID to assign to the user in this tenant',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], InviteUserToTenantDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom permissions/overrides for this user in this tenant',
        example: { canExportData: true },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], InviteUserToTenantDto.prototype, "permissions", void 0);
class UpdateTenantUserDto {
    username;
    extension;
    roleId;
    permissions;
    isActive;
}
exports.UpdateTenantUserDto = UpdateTenantUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Username for tenant email (username@subdomain.htownautos.com)',
        example: 'john.doe',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(30),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, {
        message: 'Username must be lowercase alphanumeric with dots, underscores, or hyphens only',
    }),
    __metadata("design:type", String)
], UpdateTenantUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Phone extension number (100-999)',
        example: '101',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[1-9]\d{2}$/, {
        message: 'Extension must be between 100 and 999',
    }),
    __metadata("design:type", Object)
], UpdateTenantUserDto.prototype, "extension", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'New role ID for the user',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateTenantUserDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom permissions/overrides for this user',
        example: { canExportData: false },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTenantUserDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the user is active in this tenant',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTenantUserDto.prototype, "isActive", void 0);
class AcceptInvitationDto {
    code;
}
exports.AcceptInvitationDto = AcceptInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Secret invitation code received via email',
        example: 'abc123xyz789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcceptInvitationDto.prototype, "code", void 0);
class ResendInvitationDto {
    userId;
}
exports.ResendInvitationDto = ResendInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID to resend invitation to',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ResendInvitationDto.prototype, "userId", void 0);
class RegisterWithInvitationDto {
    code;
    email;
    password;
    firstName;
    lastName;
}
exports.RegisterWithInvitationDto = RegisterWithInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Secret invitation code received via email',
        example: 'abc123xyz789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterWithInvitationDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address (must match invitation email)',
        example: 'john.doe@example.com',
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterWithInvitationDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password for the new account',
        example: 'SecurePassword123!',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterWithInvitationDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User first name',
        example: 'John',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterWithInvitationDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User last name',
        example: 'Doe',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterWithInvitationDto.prototype, "lastName", void 0);
//# sourceMappingURL=add-user-to-tenant.dto.js.map