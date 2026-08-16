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
exports.MediaEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
class MediaEntity {
    id;
    filename;
    url;
    path;
    mimeType;
    size;
    width;
    height;
    duration;
    title;
    description;
    alt;
    mediaType;
    category;
    storageProvider;
    storageBucket;
    storageKey;
    isPublic;
    isActive;
    vehicleId;
    buyerId;
    partId;
    mainImageId;
    metaValue;
    tenantId;
    createdAt;
    updatedAt;
    inspectionId;
    inspectionChecklistItemId;
    inspectionRequestItemId;
    inspectionErrorCodeId;
    carfaxReportId;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.MediaEntity = MediaEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Media UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], MediaEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original filename',
        example: 'vehicle-front.jpg',
    }),
    __metadata("design:type", String)
], MediaEntity.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full URL of the file',
        example: 'https://bucket.s3.amazonaws.com/uploads/vehicle-front.jpg',
    }),
    __metadata("design:type", String)
], MediaEntity.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Relative path in storage',
        example: 'uploads/vehicles/2024/vehicle-front.jpg',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MIME type',
        example: 'image/jpeg',
    }),
    __metadata("design:type", String)
], MediaEntity.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in bytes',
        example: 1024000,
    }),
    __metadata("design:type", Number)
], MediaEntity.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Width in pixels (for images/videos)',
        example: 1920,
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Height in pixels (for images/videos)',
        example: 1080,
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Duration in seconds (for videos)',
        example: 120,
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Title',
        example: 'Front view',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description',
        example: 'Clear front view showing the vehicle',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Alt text for images',
        example: '2020 Honda Accord front view',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "alt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Media type',
        example: 'image',
    }),
    __metadata("design:type", String)
], MediaEntity.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category',
        example: 'exterior',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Storage provider',
        example: 's3',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "storageProvider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Storage bucket name',
        example: 'htownautos-media',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "storageBucket", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Storage key',
        example: 'uploads/vehicles/2024/abc123.jpg',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "storageKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the media is public',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MediaEntity.prototype, "isPublic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the media is active',
        example: true,
    }),
    __metadata("design:type", Boolean)
], MediaEntity.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Buyer UUID (private media)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Part UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "partId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Main image UUID for vehicle',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "mainImageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Metadata in JSON format',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "metaValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tenant UUID',
        example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], MediaEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], MediaEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle inspection UUID (top-level inspection media)',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "inspectionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inspection checklist item UUID (per-item photos/videos/voice notes)',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "inspectionChecklistItemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inspection request item UUID (photo attached to a client-requested note)',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "inspectionRequestItemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inspection error code UUID (photo/video/voice attached to an error code)',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "inspectionErrorCodeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Carfax report UUID (the carfax registry attaches its file(s) here)',
    }),
    __metadata("design:type", Object)
], MediaEntity.prototype, "carfaxReportId", void 0);
//# sourceMappingURL=media.entity.js.map