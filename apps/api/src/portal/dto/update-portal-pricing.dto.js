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
exports.UpdatePortalPricingDto = void 0;
const class_validator_1 = require("class-validator");
const MAX_INSPECTION_FEE_CENTS = 99_999;
const MAX_TRAVEL_FEE_CENTS = 99_999;
class UpdatePortalPricingDto {
    inspectionFeeCents;
    travelFeeCents;
}
exports.UpdatePortalPricingDto = UpdatePortalPricingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(MAX_INSPECTION_FEE_CENTS),
    __metadata("design:type", Number)
], UpdatePortalPricingDto.prototype, "inspectionFeeCents", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(MAX_TRAVEL_FEE_CENTS),
    __metadata("design:type", Number)
], UpdatePortalPricingDto.prototype, "travelFeeCents", void 0);
//# sourceMappingURL=update-portal-pricing.dto.js.map