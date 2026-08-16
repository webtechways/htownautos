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
exports.AuctionHistoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const auction_history_service_1 = require("./auction-history.service");
let AuctionHistoryController = class AuctionHistoryController {
    auctionHistoryService;
    constructor(auctionHistoryService) {
        this.auctionHistoryService = auctionHistoryService;
    }
    async getAuctionHistory(vin) {
        return this.auctionHistoryService.getAuctionHistory(vin);
    }
};
exports.AuctionHistoryController = AuctionHistoryController;
__decorate([
    (0, common_1.Get)(':vin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get auction sale history for a VIN' }),
    (0, swagger_1.ApiParam)({ name: 'vin', description: 'Vehicle Identification Number', example: '1HGBH41JXMN109186' }),
    __param(0, (0, common_1.Param)('vin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionHistoryController.prototype, "getAuctionHistory", null);
exports.AuctionHistoryController = AuctionHistoryController = __decorate([
    (0, swagger_1.ApiTags)('Auction History'),
    (0, common_1.Controller)('auction-history'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    __metadata("design:paramtypes", [auction_history_service_1.AuctionHistoryService])
], AuctionHistoryController);
//# sourceMappingURL=auction-history.controller.js.map