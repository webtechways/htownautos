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
exports.DamageDetectorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const damage_detector_service_1 = require("./damage-detector.service");
class AnalyzeDamagesDto {
    auctionListingId;
    imageUrls;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auction listing ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnalyzeDamagesDto.prototype, "auctionListingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of image URLs to analyze', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AnalyzeDamagesDto.prototype, "imageUrls", void 0);
let DamageDetectorController = class DamageDetectorController {
    damageDetectorService;
    constructor(damageDetectorService) {
        this.damageDetectorService = damageDetectorService;
    }
    async analyze(dto) {
        const result = await this.damageDetectorService.analyzeImages(dto.auctionListingId, dto.imageUrls);
        return { data: result };
    }
    async batch(body) {
        const data = await this.damageDetectorService.getDamagePercents(body?.ids ?? []);
        return { data };
    }
    async getAnalyses(auctionListingId) {
        const analyses = await this.damageDetectorService.getAnalyses(auctionListingId);
        return { data: analyses };
    }
};
exports.DamageDetectorController = DamageDetectorController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze vehicle images for damage using AI' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyzeDamagesDto]),
    __metadata("design:returntype", Promise)
], DamageDetectorController.prototype, "analyze", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Latest damage % for a batch of lot numbers' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DamageDetectorController.prototype, "batch", null);
__decorate([
    (0, common_1.Get)(':auctionListingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get existing damage analyses for an auction listing' }),
    (0, swagger_1.ApiParam)({ name: 'auctionListingId', description: 'Auction listing ID' }),
    __param(0, (0, common_1.Param)('auctionListingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DamageDetectorController.prototype, "getAnalyses", null);
exports.DamageDetectorController = DamageDetectorController = __decorate([
    (0, swagger_1.ApiTags)('Damage Detector'),
    (0, common_1.Controller)('damage-detector'),
    __metadata("design:paramtypes", [damage_detector_service_1.DamageDetectorService])
], DamageDetectorController);
//# sourceMappingURL=damage-detector.controller.js.map