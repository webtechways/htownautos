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
exports.CreateBuyerAuctionBidsDto = exports.BidItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BidItemDto {
    lotNumber;
    maxBid;
    notes;
}
exports.BidItemDto = BidItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auction lot number', example: '12345678' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BidItemDto.prototype, "lotNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum bid amount in USD', example: 7500 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BidItemDto.prototype, "maxBid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BidItemDto.prototype, "notes", void 0);
class CreateBuyerAuctionBidsDto {
    items;
}
exports.CreateBuyerAuctionBidsDto = CreateBuyerAuctionBidsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BidItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BidItemDto),
    __metadata("design:type", Array)
], CreateBuyerAuctionBidsDto.prototype, "items", void 0);
//# sourceMappingURL=create-buyer-auction-bid.dto.js.map