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
exports.BuyerAuctionBidsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const buyer_auction_bids_service_1 = require("./buyer-auction-bids.service");
const create_buyer_auction_bid_dto_1 = require("./dto/create-buyer-auction-bid.dto");
const update_buyer_auction_bid_dto_1 = require("./dto/update-buyer-auction-bid.dto");
const auth_1 = require("@htownautos/auth");
let BuyerAuctionBidsController = class BuyerAuctionBidsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(tenantId, buyerId) {
        return this.service.list(buyerId, tenantId);
    }
    create(tenantId, userId, buyerId, dto) {
        return this.service.createMany(buyerId, tenantId, userId, dto.items);
    }
    update(tenantId, buyerId, id, dto) {
        return this.service.update(id, buyerId, tenantId, dto);
    }
    remove(tenantId, buyerId, id) {
        return this.service.remove(id, buyerId, tenantId);
    }
};
exports.BuyerAuctionBidsController = BuyerAuctionBidsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List a buyer's auction bids (cars for bids)" }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BuyerAuctionBidsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Assign one or multiple auction cars to a buyer with max bid',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, create_buyer_auction_bid_dto_1.CreateBuyerAuctionBidsDto]),
    __metadata("design:returntype", void 0)
], BuyerAuctionBidsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a buyer auction bid' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Bid UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_buyer_auction_bid_dto_1.UpdateBuyerAuctionBidDto]),
    __metadata("design:returntype", void 0)
], BuyerAuctionBidsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove an auction car from a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Bid UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BuyerAuctionBidsController.prototype, "remove", null);
exports.BuyerAuctionBidsController = BuyerAuctionBidsController = __decorate([
    (0, swagger_1.ApiTags)('Buyer Auction Bids'),
    (0, common_1.Controller)('buyers/:buyerId/auction-bids'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    __metadata("design:paramtypes", [buyer_auction_bids_service_1.BuyerAuctionBidsService])
], BuyerAuctionBidsController);
//# sourceMappingURL=buyer-auction-bids.controller.js.map