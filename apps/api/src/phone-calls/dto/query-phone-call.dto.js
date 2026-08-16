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
exports.QueryPhoneCallDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_phone_call_dto_1 = require("./create-phone-call.dto");
class QueryPhoneCallDto {
    buyerId;
    phones;
    callerId;
    direction;
    status;
    outcome;
    fromDate;
    toDate;
    page = 1;
    limit = 20;
    sortBy = 'startedAt';
    sortOrder = 'desc';
}
exports.QueryPhoneCallDto = QueryPhoneCallDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by buyer ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comma-separated list of phone numbers to search' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "phones", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by caller (TenantUser) ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "callerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: create_phone_call_dto_1.CallDirection, description: 'Filter by direction' }),
    (0, class_validator_1.IsEnum)(create_phone_call_dto_1.CallDirection),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: create_phone_call_dto_1.CallStatus, description: 'Filter by status' }),
    (0, class_validator_1.IsEnum)(create_phone_call_dto_1.CallStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: create_phone_call_dto_1.CallOutcome, description: 'Filter by outcome' }),
    (0, class_validator_1.IsEnum)(create_phone_call_dto_1.CallOutcome),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "outcome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter calls from this date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter calls to this date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryPhoneCallDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 20 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryPhoneCallDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort by field', default: 'startedAt' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order', default: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPhoneCallDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-phone-call.dto.js.map