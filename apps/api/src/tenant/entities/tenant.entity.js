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
exports.PaginatedTenantsEntity = exports.TenantWithStatsEntity = exports.TenantEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
class TenantEntity {
    id;
    clerkOrgId;
    name;
    slug;
    subdomain;
    businessName;
    taxId;
    phone;
    email;
    website;
    address;
    city;
    state;
    zipCode;
    country;
    settings;
    twilioMessagingServiceSid;
    logo;
    isActive;
    deletedAt;
    createdAt;
    updatedAt;
    postmarkDomainId;
    postmarkDkimVerified;
    postmarkReturnPathVerified;
    emailProvisionedAt;
    cloudflareDnsRecordIds;
    postmarkServerId;
    postmarkServerToken;
    postmarkWebhookId;
    feeConfig;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.TenantEntity = TenantEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TenantEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Clerk Organization ID',
        example: 'org_abc123',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "clerkOrgId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tenant display name',
        example: 'HTown Autos Houston',
    }),
    __metadata("design:type", String)
], TenantEntity.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL-friendly unique identifier',
        example: 'htown-autos-houston',
    }),
    __metadata("design:type", String)
], TenantEntity.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Subdomain for tenant emails (subdomain.htownautos.com)',
        example: 'houston',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "subdomain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Legal business name',
        example: 'HTown Autos LLC',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tax ID / EIN',
        example: '12-3456789',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "taxId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Business phone number',
        example: '+1-713-555-0100',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Business email address',
        example: 'contact@htownautos.com',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Business website URL',
        example: 'https://htownautos.com',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Street address',
        example: '1234 Main Street',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'City',
        example: 'Houston',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'State code',
        example: 'TX',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ZIP code',
        example: '77001',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "zipCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Country',
        example: 'USA',
    }),
    __metadata("design:type", String)
], TenantEntity.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tenant-specific settings as JSON',
        example: { theme: 'dark', timezone: 'America/Chicago' },
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "settings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Twilio Messaging Service ID for SMS',
        example: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "twilioMessagingServiceSid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL to tenant logo',
        example: 'https://cdn.htownautos.com/logos/houston.png',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether tenant is active',
        example: true,
    }),
    __metadata("design:type", Boolean)
], TenantEntity.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Soft-delete timestamp. Null if tenant is not deleted.',
        example: null,
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], TenantEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], TenantEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Postmark domain ID (sending domain provisioned for this tenant)',
        example: 12345,
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "postmarkDomainId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tenant email domain has verified DKIM in Postmark',
        example: false,
    }),
    __metadata("design:type", Boolean)
], TenantEntity.prototype, "postmarkDkimVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the tenant email Return-Path domain is verified',
        example: false,
    }),
    __metadata("design:type", Boolean)
], TenantEntity.prototype, "postmarkReturnPathVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp when the email domain was provisioned',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "emailProvisionedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cloudflare DNS record IDs created for this tenant (cleanup metadata)',
        example: ['abc123', 'def456'],
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "cloudflareDnsRecordIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Postmark server ID dedicated to this tenant (one per tenant for inbound)',
        example: 18950978,
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "postmarkServerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'API token for the tenant-specific Postmark server',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "postmarkServerToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Postmark webhook ID registered on the tenant server',
        example: 23758898,
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "postmarkWebhookId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Per-tenant auction fee configuration (null = system default applies)',
    }),
    __metadata("design:type", Object)
], TenantEntity.prototype, "feeConfig", void 0);
class TenantWithStatsEntity extends TenantEntity {
    userCount;
    vehicleCount;
    dealCount;
    buyerCount;
}
exports.TenantWithStatsEntity = TenantWithStatsEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of users in this tenant',
        example: 5,
    }),
    __metadata("design:type", Number)
], TenantWithStatsEntity.prototype, "userCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of vehicles in this tenant',
        example: 150,
    }),
    __metadata("design:type", Number)
], TenantWithStatsEntity.prototype, "vehicleCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of deals in this tenant',
        example: 45,
    }),
    __metadata("design:type", Number)
], TenantWithStatsEntity.prototype, "dealCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of buyers in this tenant',
        example: 120,
    }),
    __metadata("design:type", Number)
], TenantWithStatsEntity.prototype, "buyerCount", void 0);
class PaginatedTenantsEntity {
    data;
    total;
    page;
    limit;
    totalPages;
}
exports.PaginatedTenantsEntity = PaginatedTenantsEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of tenants',
        type: [TenantEntity],
    }),
    __metadata("design:type", Array)
], PaginatedTenantsEntity.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of tenants matching the query',
        example: 50,
    }),
    __metadata("design:type", Number)
], PaginatedTenantsEntity.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current page number',
        example: 1,
    }),
    __metadata("design:type", Number)
], PaginatedTenantsEntity.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10,
    }),
    __metadata("design:type", Number)
], PaginatedTenantsEntity.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of pages',
        example: 5,
    }),
    __metadata("design:type", Number)
], PaginatedTenantsEntity.prototype, "totalPages", void 0);
//# sourceMappingURL=tenant.entity.js.map