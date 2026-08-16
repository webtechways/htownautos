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
exports.PresignMediaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const create_media_dto_1 = require("./create-media.dto");
class PresignMediaDto extends create_media_dto_1.CreateMediaDto {
    filename;
    contentType;
    fileSize;
}
exports.PresignMediaDto = PresignMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original filename', example: 'photo.jpg' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PresignMediaDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type of the file', example: 'image/jpeg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^(image\/(jpeg|png|webp|gif)|application\/pdf|video\/(mp4|quicktime|webm)|audio\/(mp4|mpeg|webm|ogg|wav|x-m4a))$/, {
        message: 'Allowed: image/*, application/pdf, video/*, audio/* (for inspection voice notes)',
    }),
    __metadata("design:type", String)
], PresignMediaDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes', example: 1024000 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20 * 1024 * 1024),
    __metadata("design:type", Number)
], PresignMediaDto.prototype, "fileSize", void 0);
//# sourceMappingURL=presign-media.dto.js.map