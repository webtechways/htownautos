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
exports.CreateVehicleYearDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateVehicleYearDto {
    year;
    isActive = true;
}
exports.CreateVehicleYearDto = CreateVehicleYearDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle year (4-digit integer)',
        example: 2024,
        minimum: 1900,
        maximum: 2100,
    }),
    (0, class_validator_1.IsInt)({ message: 'Year must be an integer' }),
    (0, class_validator_1.Min)(1900, { message: 'Year must be at least 1900' }),
    (0, class_validator_1.Max)(2100, { message: 'Year must not exceed 2100' }),
    __metadata("design:type", Number)
], CreateVehicleYearDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the year is active',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isActive must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreateVehicleYearDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-vehicle-year.dto.js.map