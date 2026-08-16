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
exports.CreateUploadSessionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const media_1 = require("@htownautos/media");
class CreateUploadSessionDto {
    entityType;
    entityId;
    mediaType;
    category;
    isPublic;
}
exports.CreateUploadSessionDto = CreateUploadSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entity type to associate uploads with',
        example: 'vehicle',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUploadSessionDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entity ID to associate uploads with',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateUploadSessionDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Media type for uploads',
        enum: media_1.MediaType,
        default: media_1.MediaType.IMAGE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(media_1.MediaType),
    __metadata("design:type", String)
], CreateUploadSessionDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category for uploads',
        enum: media_1.MediaCategory,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(media_1.MediaCategory),
    __metadata("design:type", String)
], CreateUploadSessionDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether uploads should be public',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUploadSessionDto.prototype, "isPublic", void 0);
//# sourceMappingURL=create-upload-session.dto.js.map