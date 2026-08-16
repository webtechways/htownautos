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
exports.VehicleModelEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
class VehicleModelEntity {
    id;
    makeId;
    name;
    slug;
    isActive;
    createdAt;
    updatedAt;
    metaValue;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.VehicleModelEntity = VehicleModelEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle model UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], VehicleModelEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle make UUID (foreign key)',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    __metadata("design:type", String)
], VehicleModelEntity.prototype, "makeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Model name',
        example: 'Camry',
    }),
    __metadata("design:type", String)
], VehicleModelEntity.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL-friendly slug',
        example: 'camry',
    }),
    __metadata("design:type", String)
], VehicleModelEntity.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Active status',
        example: true,
    }),
    __metadata("design:type", Boolean)
], VehicleModelEntity.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], VehicleModelEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], VehicleModelEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Metadata in JSON format',
    }),
    __metadata("design:type", Object)
], VehicleModelEntity.prototype, "metaValue", void 0);
//# sourceMappingURL=vehicle-model.entity.js.map