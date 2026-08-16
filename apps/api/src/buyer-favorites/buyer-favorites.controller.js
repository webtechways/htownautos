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
exports.BuyerFavoritesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const buyer_favorites_service_1 = require("./buyer-favorites.service");
const toggle_buyer_favorite_dto_1 = require("./dto/toggle-buyer-favorite.dto");
let BuyerFavoritesController = class BuyerFavoritesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(tenantId, buyerId) {
        return this.service.list(buyerId, tenantId);
    }
    add(tenantId, buyerId, dto) {
        return this.service.add(buyerId, tenantId, {
            lotNumber: dto.lotNumber,
            vin: dto.vin,
        });
    }
    remove(buyerId, lotNumber) {
        return this.service.remove(buyerId, lotNumber);
    }
};
exports.BuyerFavoritesController = BuyerFavoritesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List a buyer's favorite auction lots (with listing detail)" }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BuyerFavoritesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a favorite auction lot to a buyer by lot number or VIN (staff/dashboard)' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, toggle_buyer_favorite_dto_1.ToggleBuyerFavoriteDto]),
    __metadata("design:returntype", void 0)
], BuyerFavoritesController.prototype, "add", null);
__decorate([
    (0, common_1.Delete)(':lotNumber'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a favorite from a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'lotNumber', description: 'Auction lot number' }),
    __param(0, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BuyerFavoritesController.prototype, "remove", null);
exports.BuyerFavoritesController = BuyerFavoritesController = __decorate([
    (0, swagger_1.ApiTags)('Buyer Favorites'),
    (0, common_1.Controller)('buyers/:buyerId/favorites'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    __metadata("design:paramtypes", [buyer_favorites_service_1.BuyerFavoritesService])
], BuyerFavoritesController);
//# sourceMappingURL=buyer-favorites.controller.js.map