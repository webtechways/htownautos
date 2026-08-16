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
exports.CreateTitleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateTitleDto {
    titleNumber;
    titleState;
    titleStatusId;
    brandStatusId;
    titleReceivedDate;
    titleIssueDate;
    titleSentDate;
    transferDate;
    titleAppNumber;
    frontImageId;
    backImageId;
}
exports.CreateTitleDto = CreateTitleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ROS / Title number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateTitleDto.prototype, "titleNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Title state (e.g., TX, CA, FL)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], CreateTitleDto.prototype, "titleState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Title status ID (nomenclator)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'titleStatusId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' || value === null ? undefined : value)),
    __metadata("design:type", String)
], CreateTitleDto.prototype, "titleStatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Brand status ID (nomenclator)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'brandStatusId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' || value === null ? undefined : value)),
    __metadata("design:type", String)
], CreateTitleDto.prototype, "brandStatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Title received date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateTitleDto.prototype, "titleReceivedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Title issue date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateTitleDto.prototype, "titleIssueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Title sent/out date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateTitleDto.prototype, "titleSentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Title transferred date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateTitleDto.prototype, "transferDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Title application number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateTitleDto.prototype, "titleAppNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Front image ID (media)', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'frontImageId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? null : value)),
    __metadata("design:type", Object)
], CreateTitleDto.prototype, "frontImageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Back image ID (media)', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'backImageId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? null : value)),
    __metadata("design:type", Object)
], CreateTitleDto.prototype, "backImageId", void 0);
//# sourceMappingURL=create-title.dto.js.map