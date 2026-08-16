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
exports.NomenclatorEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
class NomenclatorEntity {
    id;
    slug;
    title;
    isActive;
    createdAt;
    updatedAt;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.NomenclatorEntity = NomenclatorEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nomenclator UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], NomenclatorEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL-friendly slug (unique identifier)',
        example: 'retail',
    }),
    __metadata("design:type", String)
], NomenclatorEntity.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Display title',
        example: 'Retail',
    }),
    __metadata("design:type", String)
], NomenclatorEntity.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Active status',
        example: true,
    }),
    __metadata("design:type", Boolean)
], NomenclatorEntity.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], NomenclatorEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], NomenclatorEntity.prototype, "updatedAt", void 0);
//# sourceMappingURL=nomenclator.entity.js.map