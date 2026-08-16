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
exports.CreateInvestmentDto = exports.PAYBACK_INTERVALS = exports.INVESTMENT_SOURCES = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
exports.INVESTMENT_SOURCES = [
    'CREDIT_CARD',
    'CREDIT_LINE',
    'CAPITAL_FRIEND',
    'LOAN',
    'INVESTOR_GUEST',
];
exports.PAYBACK_INTERVALS = [
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'ANNUAL',
    'ONE_TIME',
];
class CreateInvestmentDto {
    amount;
    source;
    sourceAccount;
    payBackAmount;
    payBackInterval;
    settleDeadline;
    notes;
}
exports.CreateInvestmentDto = CreateInvestmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount invested', example: 5000 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateInvestmentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Funding source',
        enum: exports.INVESTMENT_SOURCES,
        example: 'CREDIT_CARD',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.INVESTMENT_SOURCES),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Specific account / person the money came from',
        example: 'Chase Visa 1234',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "sourceAccount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total amount to pay back', example: 5600 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateInvestmentDto.prototype, "payBackAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payback cadence',
        enum: exports.PAYBACK_INTERVALS,
        example: 'MONTHLY',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.PAYBACK_INTERVALS),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "payBackInterval", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deadline to fully settle (ISO date)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "settleDeadline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "notes", void 0);
//# sourceMappingURL=create-investment.dto.js.map