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
exports.UpdatePartCategoryDto = exports.CreatePartCategoryDto = exports.UpdatePartStatusDto = exports.CreatePartStatusDto = exports.UpdatePartConditionDto = exports.CreatePartConditionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePartConditionDto {
    slug;
    title;
    isActive;
}
exports.CreatePartConditionDto = CreatePartConditionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL-friendly slug',
        example: 'used',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartConditionDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Display title',
        example: 'Used',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePartConditionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is active',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePartConditionDto.prototype, "isActive", void 0);
class UpdatePartConditionDto extends (0, swagger_1.PartialType)(CreatePartConditionDto) {
}
exports.UpdatePartConditionDto = UpdatePartConditionDto;
class CreatePartStatusDto {
    slug;
    title;
    isActive;
}
exports.CreatePartStatusDto = CreatePartStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL-friendly slug',
        example: 'in-stock',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartStatusDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Display title',
        example: 'In Stock',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePartStatusDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is active',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePartStatusDto.prototype, "isActive", void 0);
class UpdatePartStatusDto extends (0, swagger_1.PartialType)(CreatePartStatusDto) {
}
exports.UpdatePartStatusDto = UpdatePartStatusDto;
class CreatePartCategoryDto {
    slug;
    title;
    description;
    parentId;
    isActive;
}
exports.CreatePartCategoryDto = CreatePartCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL-friendly slug',
        example: 'engine-parts',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartCategoryDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Display title',
        example: 'Engine Parts',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePartCategoryDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category description',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent category ID (for subcategories)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartCategoryDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is active',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePartCategoryDto.prototype, "isActive", void 0);
class UpdatePartCategoryDto extends (0, swagger_1.PartialType)(CreatePartCategoryDto) {
}
exports.UpdatePartCategoryDto = UpdatePartCategoryDto;
//# sourceMappingURL=part-nomenclator.dto.js.map