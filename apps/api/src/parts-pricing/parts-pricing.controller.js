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
exports.PartsPricingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const parts_pricing_service_1 = require("./parts-pricing.service");
class AnalyzePartsDto {
    auctionListingId;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auction listing ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnalyzePartsDto.prototype, "auctionListingId", void 0);
let PartsPricingController = class PartsPricingController {
    partsPricingService;
    constructor(partsPricingService) {
        this.partsPricingService = partsPricingService;
    }
    async analyze(dto) {
        const result = await this.partsPricingService.analyzeParts(dto.auctionListingId);
        return { data: result };
    }
    async getParts(auctionListingId) {
        const parts = await this.partsPricingService.getParts(auctionListingId);
        return { data: parts };
    }
};
exports.PartsPricingController = PartsPricingController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market prices for vehicle parts using AI' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyzePartsDto]),
    __metadata("design:returntype", Promise)
], PartsPricingController.prototype, "analyze", null);
__decorate([
    (0, common_1.Get)(':auctionListingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get existing parts pricing for an auction listing' }),
    (0, swagger_1.ApiParam)({ name: 'auctionListingId', description: 'Auction listing ID' }),
    __param(0, (0, common_1.Param)('auctionListingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PartsPricingController.prototype, "getParts", null);
exports.PartsPricingController = PartsPricingController = __decorate([
    (0, swagger_1.ApiTags)('Parts Pricing'),
    (0, common_1.Controller)('parts-pricing'),
    __metadata("design:paramtypes", [parts_pricing_service_1.PartsPricingService])
], PartsPricingController);
//# sourceMappingURL=parts-pricing.controller.js.map