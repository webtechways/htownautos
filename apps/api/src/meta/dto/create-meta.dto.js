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
exports.CreateMetaDto = exports.MetaValueType = exports.MetaEntityType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var MetaEntityType;
(function (MetaEntityType) {
    MetaEntityType["USER"] = "user";
    MetaEntityType["VEHICLE"] = "vehicle";
    MetaEntityType["BUYER"] = "buyer";
    MetaEntityType["DEAL"] = "deal";
    MetaEntityType["TITLE"] = "title";
    MetaEntityType["MEDIA"] = "media";
    MetaEntityType["VEHICLE_YEAR"] = "vehicleYear";
    MetaEntityType["VEHICLE_MAKE"] = "vehicleMake";
    MetaEntityType["VEHICLE_MODEL"] = "vehicleModel";
    MetaEntityType["VEHICLE_TRIM"] = "vehicleTrim";
    MetaEntityType["EXTRA_EXPENSE"] = "extraExpense";
})(MetaEntityType || (exports.MetaEntityType = MetaEntityType = {}));
var MetaValueType;
(function (MetaValueType) {
    MetaValueType["STRING"] = "string";
    MetaValueType["NUMBER"] = "number";
    MetaValueType["BOOLEAN"] = "boolean";
    MetaValueType["JSON"] = "json";
    MetaValueType["DATE"] = "date";
})(MetaValueType || (exports.MetaValueType = MetaValueType = {}));
class CreateMetaDto {
    entityType;
    entityId;
    userId;
    key;
    value;
    valueType;
    description;
    isPublic;
    isSystem;
    isActive;
}
exports.CreateMetaDto = CreateMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of entity this meta belongs to',
        enum: MetaEntityType,
        example: MetaEntityType.VEHICLE,
    }),
    (0, class_validator_1.IsEnum)(MetaEntityType),
    __metadata("design:type", String)
], CreateMetaDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the entity',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMetaDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User ID who created this meta',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMetaDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Meta key/name',
        example: 'custom_field_1',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateMetaDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Meta value as string',
        example: 'Some custom value',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMetaDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Type of value stored',
        enum: MetaValueType,
        default: MetaValueType.STRING,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MetaValueType),
    __metadata("design:type", String)
], CreateMetaDto.prototype, "valueType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of this meta field',
        example: 'Custom field for tracking special requirements',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateMetaDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this meta publicly visible',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMetaDto.prototype, "isPublic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this a system meta (not user-editable)',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMetaDto.prototype, "isSystem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is this meta active',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMetaDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-meta.dto.js.map