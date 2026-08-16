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
exports.Vehicle = void 0;
const swagger_1 = require("@nestjs/swagger");
class Vehicle {
    id;
    vin;
    stockNumber;
    yearId;
    makeId;
    modelId;
    trimId;
    mileage;
    exteriorColor;
    interiorColor;
    vehicleTypeId;
    bodyTypeId;
    fuelTypeId;
    driveTypeId;
    transmissionTypeId;
    vehicleConditionId;
    vehicleStatusId;
    sourceId;
    costPrice;
    listPrice;
    salePrice;
    engine;
    cylinders;
    doors;
    passengers;
    description;
    features;
    notes;
    mainImageId;
    metaValue;
    createdAt;
    updatedAt;
}
exports.Vehicle = Vehicle;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle Identification Number (VIN)',
        example: '1HGBH41JXMN109186',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Stock number',
        example: 'STK-2024-001',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "stockNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vehicle year ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "yearId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vehicle make ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "makeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vehicle model ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "modelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vehicle trim ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "trimId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mileage in miles' }),
    __metadata("design:type", Number)
], Vehicle.prototype, "mileage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Exterior color' }),
    __metadata("design:type", String)
], Vehicle.prototype, "exteriorColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Interior color' }),
    __metadata("design:type", String)
], Vehicle.prototype, "interiorColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vehicle type ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "vehicleTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Body type ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "bodyTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fuel type ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "fuelTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Drive type ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "driveTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transmission type ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "transmissionTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vehicle condition ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "vehicleConditionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vehicle status ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "vehicleStatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Source ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "sourceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cost price' }),
    __metadata("design:type", Number)
], Vehicle.prototype, "costPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'List price' }),
    __metadata("design:type", Number)
], Vehicle.prototype, "listPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sale price' }),
    __metadata("design:type", Number)
], Vehicle.prototype, "salePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Engine description' }),
    __metadata("design:type", String)
], Vehicle.prototype, "engine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of cylinders' }),
    __metadata("design:type", Number)
], Vehicle.prototype, "cylinders", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of doors' }),
    __metadata("design:type", Number)
], Vehicle.prototype, "doors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Passenger capacity' }),
    __metadata("design:type", Number)
], Vehicle.prototype, "passengers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vehicle description' }),
    __metadata("design:type", String)
], Vehicle.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Features' }),
    __metadata("design:type", String)
], Vehicle.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Internal notes (not visible to customers)' }),
    __metadata("design:type", String)
], Vehicle.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Main image ID' }),
    __metadata("design:type", String)
], Vehicle.prototype, "mainImageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Metadata' }),
    __metadata("design:type", Object)
], Vehicle.prototype, "metaValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], Vehicle.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], Vehicle.prototype, "updatedAt", void 0);
//# sourceMappingURL=vehicle.entity.js.map