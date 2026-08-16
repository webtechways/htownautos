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
var ListingReviewsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingReviewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const listing_reviews_service_1 = require("./listing-reviews.service");
const auth_1 = require("@htownautos/auth");
const class_validator_1 = require("class-validator");
class UpsertReviewDto {
    notes;
    checked;
    damageLevel;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertReviewDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpsertReviewDto.prototype, "checked", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpsertReviewDto.prototype, "damageLevel", void 0);
let ListingReviewsController = ListingReviewsController_1 = class ListingReviewsController {
    service;
    logger = new common_1.Logger(ListingReviewsController_1.name);
    constructor(service) {
        this.service = service;
    }
    async get(tenantId, lotNumber) {
        const review = await this.service.getByLotNumber(tenantId, BigInt(lotNumber));
        return { data: review };
    }
    async upsert(tenantId, userId, lotNumber, dto) {
        this.logger.log(`[PUT ${lotNumber}] tenantId=${tenantId}, userId=${userId}, dto=${JSON.stringify(dto)}`);
        const review = await this.service.upsert(tenantId, userId, BigInt(lotNumber), dto);
        return { data: review };
    }
};
exports.ListingReviewsController = ListingReviewsController;
__decorate([
    (0, common_1.Get)(':lotNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get review for a listing' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingReviewsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':lotNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update review for a listing' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Param)('lotNumber')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, UpsertReviewDto]),
    __metadata("design:returntype", Promise)
], ListingReviewsController.prototype, "upsert", null);
exports.ListingReviewsController = ListingReviewsController = ListingReviewsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Listing Reviews'),
    (0, common_1.Controller)('listing-reviews'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    __metadata("design:paramtypes", [listing_reviews_service_1.ListingReviewsService])
], ListingReviewsController);
//# sourceMappingURL=listing-reviews.controller.js.map