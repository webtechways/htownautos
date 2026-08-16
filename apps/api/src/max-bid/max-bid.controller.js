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
exports.MaxBidController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const max_bid_service_1 = require("./max-bid.service");
class MarketPriceDataDto {
    marketcheckPrice;
    msrp;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], MarketPriceDataDto.prototype, "marketcheckPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], MarketPriceDataDto.prototype, "msrp", void 0);
class CompsDataDto {
    listings;
    numFound;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], CompsDataDto.prototype, "listings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CompsDataDto.prototype, "numFound", void 0);
class CalculateMaxBidDto {
    auctionListingId;
    marketPriceData;
    compsData;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auction listing ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CalculateMaxBidDto.prototype, "auctionListingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Market price data from MarketCheck' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", MarketPriceDataDto)
], CalculateMaxBidDto.prototype, "marketPriceData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Comparable vehicles data from MarketCheck' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", CompsDataDto)
], CalculateMaxBidDto.prototype, "compsData", void 0);
let MaxBidController = class MaxBidController {
    maxBidService;
    constructor(maxBidService) {
        this.maxBidService = maxBidService;
    }
    async calculate(dto) {
        const result = await this.maxBidService.calculateMaxBid(dto.auctionListingId, dto.marketPriceData, dto.compsData);
        return { data: result };
    }
    async getRecommendations(auctionListingId) {
        const recommendations = await this.maxBidService.getRecommendations(auctionListingId);
        return { data: recommendations };
    }
};
exports.MaxBidController = MaxBidController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate max bid recommendation using AI' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CalculateMaxBidDto]),
    __metadata("design:returntype", Promise)
], MaxBidController.prototype, "calculate", null);
__decorate([
    (0, common_1.Get)(':auctionListingId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get existing max bid recommendations for an auction listing',
    }),
    (0, swagger_1.ApiParam)({ name: 'auctionListingId', description: 'Auction listing ID' }),
    __param(0, (0, common_1.Param)('auctionListingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MaxBidController.prototype, "getRecommendations", null);
exports.MaxBidController = MaxBidController = __decorate([
    (0, swagger_1.ApiTags)('Max Bid Recommendation'),
    (0, common_1.Controller)('max-bid'),
    __metadata("design:paramtypes", [max_bid_service_1.MaxBidService])
], MaxBidController);
//# sourceMappingURL=max-bid.controller.js.map