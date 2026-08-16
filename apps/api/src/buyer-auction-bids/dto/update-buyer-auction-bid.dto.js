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
exports.UpdateBuyerAuctionBidDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateBuyerAuctionBidDto {
    maxBid;
    status;
    finalAmount;
    notes;
}
exports.UpdateBuyerAuctionBidDto = UpdateBuyerAuctionBidDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum bid amount in USD', example: 7500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateBuyerAuctionBidDto.prototype, "maxBid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['pending', 'won', 'lost'], description: 'Bid outcome' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['pending', 'won', 'lost']),
    __metadata("design:type", String)
], UpdateBuyerAuctionBidDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Final amount (paid if won, final bid if lost)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], UpdateBuyerAuctionBidDto.prototype, "finalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBuyerAuctionBidDto.prototype, "notes", void 0);
//# sourceMappingURL=update-buyer-auction-bid.dto.js.map