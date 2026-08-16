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
exports.VehicleYearEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
class VehicleYearEntity {
    id;
    year;
    isActive;
    createdAt;
    updatedAt;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.VehicleYearEntity = VehicleYearEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], VehicleYearEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle year',
        example: 2024,
    }),
    __metadata("design:type", Number)
], VehicleYearEntity.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the year is active',
        example: true,
    }),
    __metadata("design:type", Boolean)
], VehicleYearEntity.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], VehicleYearEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-12T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], VehicleYearEntity.prototype, "updatedAt", void 0);
//# sourceMappingURL=vehicle-year.entity.js.map