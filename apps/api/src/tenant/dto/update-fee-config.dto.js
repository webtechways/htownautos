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
exports.UpdateFeeConfigDto = exports.BiddingFeeTableDto = exports.BiddingFeeRowDto = exports.BrokerFeeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class BrokerFeeDto {
    fixed;
    pct;
}
exports.BrokerFeeDto = BrokerFeeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Flat broker fee floor (dollars)', example: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BrokerFeeDto.prototype, "fixed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Broker percentage of highBid (0–100)', example: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BrokerFeeDto.prototype, "pct", void 0);
class BiddingFeeRowDto {
    min;
    max;
    cs;
    cu;
    ns;
    nu;
}
exports.BiddingFeeRowDto = BiddingFeeRowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lower bound of bid range (inclusive)', example: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BiddingFeeRowDto.prototype, "min", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Upper bound of bid range (inclusive); null = no upper bound', example: 49.99, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BiddingFeeRowDto.prototype, "max", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'clean + secured value (flat $ or "N%" string)', example: 25 }),
    __metadata("design:type", Object)
], BiddingFeeRowDto.prototype, "cs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'clean + unsecured value', example: 27.5 }),
    __metadata("design:type", Object)
], BiddingFeeRowDto.prototype, "cu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'nonClean + secured value', example: 25 }),
    __metadata("design:type", Object)
], BiddingFeeRowDto.prototype, "ns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'nonClean + unsecured value', example: 27.5 }),
    __metadata("design:type", Object)
], BiddingFeeRowDto.prototype, "nu", void 0);
class BiddingFeeTableDto {
    rows;
}
exports.BiddingFeeTableDto = BiddingFeeTableDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BiddingFeeRowDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BiddingFeeRowDto),
    __metadata("design:type", Array)
], BiddingFeeTableDto.prototype, "rows", void 0);
class UpdateFeeConfigDto {
    paymentMethod;
    gateFee;
    environmentalFee;
    broker;
    biddingFee;
}
exports.UpdateFeeConfigDto = UpdateFeeConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['secured', 'unsecured'], description: 'Default payment method' }),
    (0, class_validator_1.IsIn)(['secured', 'unsecured']),
    __metadata("design:type", String)
], UpdateFeeConfigDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gate fee in dollars', example: 95 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateFeeConfigDto.prototype, "gateFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Environmental fee in dollars', example: 15 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateFeeConfigDto.prototype, "environmentalFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BrokerFeeDto }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BrokerFeeDto),
    __metadata("design:type", BrokerFeeDto)
], UpdateFeeConfigDto.prototype, "broker", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BiddingFeeTableDto }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BiddingFeeTableDto),
    __metadata("design:type", BiddingFeeTableDto)
], UpdateFeeConfigDto.prototype, "biddingFee", void 0);
//# sourceMappingURL=update-fee-config.dto.js.map