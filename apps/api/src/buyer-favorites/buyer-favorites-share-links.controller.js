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
exports.BuyerFavoritesShareLinksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const buyer_favorites_share_links_service_1 = require("./buyer-favorites-share-links.service");
const create_favorites_share_link_dto_1 = require("./dto/create-favorites-share-link.dto");
let BuyerFavoritesShareLinksController = class BuyerFavoritesShareLinksController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(tenantId, userId, buyerId, dto) {
        return this.service.create(buyerId, tenantId, userId, dto);
    }
    resolvePublic(token) {
        return this.service.resolvePublic(token);
    }
    removePublic(lotNumber, token) {
        return this.service.removePublic(token, lotNumber);
    }
};
exports.BuyerFavoritesShareLinksController = BuyerFavoritesShareLinksController;
__decorate([
    (0, common_1.Post)('buyers/:buyerId/favorites/share-link'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: "Create a public share link for a buyer's favorites list" }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, create_favorites_share_link_dto_1.CreateFavoritesShareLinkDto]),
    __metadata("design:returntype", void 0)
], BuyerFavoritesShareLinksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('public/favorites'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: "Public read-only view of a buyer's shared favorites" }),
    (0, swagger_1.ApiQuery)({ name: 'token', required: true, description: '32-byte hex share token' }),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BuyerFavoritesShareLinksController.prototype, "resolvePublic", null);
__decorate([
    (0, common_1.Delete)('public/favorites/:lotNumber'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a lot from the shared favorites list (public, token-gated)' }),
    (0, swagger_1.ApiParam)({ name: 'lotNumber', description: 'Auction lot number' }),
    (0, swagger_1.ApiQuery)({ name: 'token', required: true, description: '32-byte hex share token' }),
    __param(0, (0, common_1.Param)('lotNumber')),
    __param(1, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BuyerFavoritesShareLinksController.prototype, "removePublic", null);
exports.BuyerFavoritesShareLinksController = BuyerFavoritesShareLinksController = __decorate([
    (0, swagger_1.ApiTags)('Buyer Favorites Share Links'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [buyer_favorites_share_links_service_1.BuyerFavoritesShareLinksService])
], BuyerFavoritesShareLinksController);
//# sourceMappingURL=buyer-favorites-share-links.controller.js.map