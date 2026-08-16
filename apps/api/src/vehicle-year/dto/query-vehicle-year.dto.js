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
exports.QueryVehicleYearDto = exports.YearFilterOperator = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const common_1 = require("@htownautos/common");
var YearFilterOperator;
(function (YearFilterOperator) {
    YearFilterOperator["EQUAL"] = "eq";
    YearFilterOperator["GREATER_THAN"] = "gt";
    YearFilterOperator["LESS_THAN"] = "lt";
    YearFilterOperator["GREATER_THAN_OR_EQUAL"] = "gte";
    YearFilterOperator["LESS_THAN_OR_EQUAL"] = "lte";
})(YearFilterOperator || (exports.YearFilterOperator = YearFilterOperator = {}));
class QueryVehicleYearDto extends common_1.PaginationDto {
    year;
    operator = YearFilterOperator.EQUAL;
    isActive;
}
exports.QueryVehicleYearDto = QueryVehicleYearDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by year value',
        example: 2020,
        minimum: 1900,
        maximum: 2100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Year must be a 4-digit integer' }),
    (0, class_validator_1.Min)(1900, { message: 'Year must be at least 1900' }),
    (0, class_validator_1.Max)(2100, { message: 'Year must not exceed 2100' }),
    __metadata("design:type", Number)
], QueryVehicleYearDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Year filter operator',
        enum: YearFilterOperator,
        default: YearFilterOperator.EQUAL,
        example: YearFilterOperator.GREATER_THAN,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(YearFilterOperator, {
        message: `Operator must be one of: ${Object.values(YearFilterOperator).join(', ')}`,
    }),
    __metadata("design:type", String)
], QueryVehicleYearDto.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by active status',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)({ message: 'isActive must be a boolean value' }),
    __metadata("design:type", Boolean)
], QueryVehicleYearDto.prototype, "isActive", void 0);
//# sourceMappingURL=query-vehicle-year.dto.js.map