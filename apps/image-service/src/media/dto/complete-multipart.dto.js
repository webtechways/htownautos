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
exports.CompleteMultipartDto = exports.MultipartPartDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const init_multipart_dto_1 = require("./init-multipart.dto");
class MultipartPartDto {
    partNumber;
    etag;
}
exports.MultipartPartDto = MultipartPartDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Part number (1-indexed)', example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], MultipartPartDto.prototype, "partNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ETag returned by S3 for this part (verbatim, with quotes if present)',
        example: '"d41d8cd98f00b204e9800998ecf8427e"',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MultipartPartDto.prototype, "etag", void 0);
class CompleteMultipartDto extends init_multipart_dto_1.InitMultipartDto {
    uploadId;
    key;
    parts;
}
exports.CompleteMultipartDto = CompleteMultipartDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload session id returned by init' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteMultipartDto.prototype, "uploadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'S3 key returned by init', example: 'uploads/2026/uuid/original.mp4' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteMultipartDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Uploaded parts, with partNumber and the ETag S3 returned',
        type: [MultipartPartDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(10000),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MultipartPartDto),
    __metadata("design:type", Array)
], CompleteMultipartDto.prototype, "parts", void 0);
//# sourceMappingURL=complete-multipart.dto.js.map