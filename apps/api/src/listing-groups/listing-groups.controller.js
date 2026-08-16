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
exports.ListingGroupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const listing_groups_service_1 = require("./listing-groups.service");
const create_listing_group_dto_1 = require("./dto/create-listing-group.dto");
const manage_group_items_dto_1 = require("./dto/manage-group-items.dto");
const auth_1 = require("@htownautos/auth");
let ListingGroupsController = class ListingGroupsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findAll(tenantId) {
        const data = await this.service.findAll(tenantId);
        return { data };
    }
    async create(tenantId, user, dto) {
        return this.service.create(tenantId, user.id, dto);
    }
    async update(tenantId, id, dto) {
        return this.service.update(tenantId, id, dto);
    }
    async remove(tenantId, id) {
        return this.service.remove(tenantId, id);
    }
    async getGroupsForLot(tenantId, lotNumber) {
        return this.service.getGroupsForLot(tenantId, lotNumber);
    }
    async getItems(tenantId, id) {
        return this.service.getItems(tenantId, id);
    }
    async addItems(tenantId, id, dto) {
        return this.service.addItems(tenantId, id, dto.lotNumbers);
    }
    async removeItem(tenantId, id, lotNumber) {
        return this.service.removeItem(tenantId, id, lotNumber);
    }
};
exports.ListingGroupsController = ListingGroupsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all listing groups for the tenant' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListingGroupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new listing group' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_listing_group_dto_1.CreateListingGroupDto]),
    __metadata("design:returntype", Promise)
], ListingGroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a listing group' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_listing_group_dto_1.UpdateListingGroupDto]),
    __metadata("design:returntype", Promise)
], ListingGroupsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a listing group' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingGroupsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('by-lot/:lotNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all groups a listing belongs to' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingGroupsController.prototype, "getGroupsForLot", null);
__decorate([
    (0, common_1.Get)(':id/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all lot numbers in a group' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingGroupsController.prototype, "getItems", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Add listings to a group' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_group_items_dto_1.AddItemsToGroupDto]),
    __metadata("design:returntype", Promise)
], ListingGroupsController.prototype, "addItems", null);
__decorate([
    (0, common_1.Delete)(':id/items/:lotNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a listing from a group' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ListingGroupsController.prototype, "removeItem", null);
exports.ListingGroupsController = ListingGroupsController = __decorate([
    (0, swagger_1.ApiTags)('Listing Groups'),
    (0, common_1.Controller)('listing-groups'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    __metadata("design:paramtypes", [listing_groups_service_1.ListingGroupsService])
], ListingGroupsController);
//# sourceMappingURL=listing-groups.controller.js.map