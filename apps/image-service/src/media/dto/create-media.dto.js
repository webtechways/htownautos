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
exports.CreateMediaDto = exports.MediaCategory = exports.MediaType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["VIDEO"] = "video";
    MediaType["DOCUMENT"] = "document";
    MediaType["AUDIO"] = "audio";
})(MediaType || (exports.MediaType = MediaType = {}));
var MediaCategory;
(function (MediaCategory) {
    MediaCategory["EXTERIOR"] = "exterior";
    MediaCategory["INTERIOR"] = "interior";
    MediaCategory["ENGINE"] = "engine";
    MediaCategory["DOCUMENT"] = "document";
    MediaCategory["RECEIPT"] = "receipt";
    MediaCategory["TITLE"] = "title";
    MediaCategory["OTHER"] = "other";
    MediaCategory["INSPECTION_REQUEST"] = "inspection_request";
    MediaCategory["INSPECTION_ITEM"] = "inspection_item";
    MediaCategory["INSPECTION_ERROR_CODE"] = "inspection_error_code";
    MediaCategory["INSPECTION_VOICE"] = "inspection_voice";
    MediaCategory["INSPECTION_FULL_EXTERIOR_VIDEO"] = "inspection_full_exterior_video";
    MediaCategory["INSPECTION_FULL_INTERIOR_VIDEO"] = "inspection_full_interior_video";
    MediaCategory["INSPECTION_FULL_ENGINE_VIDEO"] = "inspection_full_engine_video";
})(MediaCategory || (exports.MediaCategory = MediaCategory = {}));
class CreateMediaDto {
    title;
    description;
    alt;
    mediaType;
    category;
    vehicleId;
    buyerId;
    partId;
    inspectionId;
    inspectionChecklistItemId;
    inspectionRequestItemId;
    inspectionErrorCodeId;
    carfaxReportId;
    isPublic;
}
exports.CreateMediaDto = CreateMediaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Title of the media',
        example: 'Front view of vehicle',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the media',
        example: 'Clear front view showing the grille and headlights',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Alt text for images',
        example: '2020 Honda Accord front view',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "alt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Media type',
        enum: MediaType,
        example: MediaType.IMAGE,
    }),
    (0, class_validator_1.IsEnum)(MediaType),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Media category',
        enum: MediaCategory,
        example: MediaCategory.EXTERIOR,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MediaCategory),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle UUID to associate with',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Buyer UUID to associate with (PRIVATE - automatically sets isPublic to false)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Part UUID to associate with',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "partId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vehicle inspection UUID (top-level inspection media)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "inspectionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Inspection checklist item UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "inspectionChecklistItemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Inspection request item UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "inspectionRequestItemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Inspection error code UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "inspectionErrorCodeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Carfax report UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "carfaxReportId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the media is public (ignored if buyerId is provided - buyer media is always private)',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMediaDto.prototype, "isPublic", void 0);
//# sourceMappingURL=create-media.dto.js.map