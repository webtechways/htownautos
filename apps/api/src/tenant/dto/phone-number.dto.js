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
exports.UpdatePhoneNumberDto = exports.PurchasePhoneNumberDto = exports.SearchPhoneNumbersDto = exports.NumberType = exports.SearchType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var SearchType;
(function (SearchType) {
    SearchType["STATE"] = "state";
    SearchType["AREA_CODE"] = "areaCode";
    SearchType["TOLL_FREE"] = "tollFree";
})(SearchType || (exports.SearchType = SearchType = {}));
var NumberType;
(function (NumberType) {
    NumberType["LOCAL"] = "local";
    NumberType["TOLL_FREE"] = "tollFree";
})(NumberType || (exports.NumberType = NumberType = {}));
class SearchPhoneNumbersDto {
    type;
    value;
    numberType;
}
exports.SearchPhoneNumbersDto = SearchPhoneNumbersDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: SearchType,
        description: 'Search by state, area code, or toll-free',
        example: 'state',
    }),
    (0, class_validator_1.IsEnum)(SearchType),
    __metadata("design:type", String)
], SearchPhoneNumbersDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'State code (e.g., TX) or area code (e.g., 713). Not required for toll-free.',
        example: 'TX',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchPhoneNumbersDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: NumberType,
        description: 'Type of number to search: local or tollFree',
        example: 'local',
        default: 'local',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(NumberType),
    __metadata("design:type", String)
], SearchPhoneNumbersDto.prototype, "numberType", void 0);
class PurchasePhoneNumberDto {
    phoneNumber;
    friendlyName;
    isPrimary;
}
exports.PurchasePhoneNumberDto = PurchasePhoneNumberDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number in E.164 format',
        example: '+15551234567',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\+1\d{10}$/, { message: 'Phone number must be in E.164 format (e.g., +15551234567)' }),
    __metadata("design:type", String)
], PurchasePhoneNumberDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Friendly name for the phone number',
        example: 'Main Sales Line',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchasePhoneNumberDto.prototype, "friendlyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether this is the primary number for the tenant',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PurchasePhoneNumberDto.prototype, "isPrimary", void 0);
class UpdatePhoneNumberDto {
    friendlyName;
    isPrimary;
    isActive;
}
exports.UpdatePhoneNumberDto = UpdatePhoneNumberDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Friendly name for the phone number',
        example: 'Support Line',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePhoneNumberDto.prototype, "friendlyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether this is the primary number for the tenant',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePhoneNumberDto.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the number is active',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePhoneNumberDto.prototype, "isActive", void 0);
//# sourceMappingURL=phone-number.dto.js.map