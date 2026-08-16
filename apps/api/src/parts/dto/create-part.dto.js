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
exports.CreatePartDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreatePartDto {
    name;
    partNumber;
    sku;
    description;
    notes;
    categoryId;
    conditionId;
    statusId;
    cost;
    price;
    quantity;
    minQuantity;
    location;
    warehouseSection;
    yearId;
    makeId;
    modelId;
    trimId;
    sourceVin;
    sourceMiles;
    sourceVehicleId;
    mainImageId;
    weight;
    length;
    width;
    height;
    warrantyDays;
    warrantyNotes;
    supplier;
    supplierPartNumber;
    purchaseDate;
    purchaseOrderNumber;
    brand;
    manufacturer;
    countryOfOrigin;
    isOem;
    isAftermarket;
    metaValue;
}
exports.CreatePartDto = CreatePartDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the part',
        example: 'Front Bumper Cover',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePartDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'OEM or aftermarket part number',
        example: '52119-47904',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartDto.prototype, "partNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal SKU',
        example: 'SKU-BMP-001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed description of the part',
        example: 'OEM front bumper cover for Toyota Prius 2016-2019, black unpainted',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal notes',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category ID',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Condition ID (New, Used, Rebuilt, etc.)',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "conditionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status ID (In Stock, Sold, Reserved, etc.)',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Acquisition cost',
        example: 150.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sale price',
        example: 299.99,
    }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Quantity in stock',
        default: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum quantity for alert',
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "minQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Warehouse location (shelf, bin, etc.)',
        example: 'A-12-3',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Warehouse section',
        example: 'Body Parts',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartDto.prototype, "warehouseSection", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Compatible year ID',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "yearId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Compatible make ID',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "makeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Compatible model ID',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "modelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Compatible trim ID',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "trimId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'VIN of the source vehicle (for used parts)',
        example: '1HGBH41JXMN109186',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(17),
    __metadata("design:type", String)
], CreatePartDto.prototype, "sourceVin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Mileage of the source vehicle',
        example: 85000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "sourceMiles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Source vehicle ID (if in system)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "sourceVehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Main image ID',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "mainImageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Weight in pounds',
        example: 12.5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Length in inches',
        example: 48.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "length", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Width in inches',
        example: 24.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Height in inches',
        example: 12.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Warranty days',
        example: 90,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePartDto.prototype, "warrantyDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Warranty notes',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "warrantyNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Supplier name',
        example: 'LKQ Corporation',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePartDto.prototype, "supplier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Supplier part number',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartDto.prototype, "supplierPartNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Purchase date',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePartDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Purchase order number',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartDto.prototype, "purchaseOrderNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Part brand',
        example: 'Toyota',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Manufacturer',
        example: 'Toyota Motor Corporation',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePartDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Country of origin',
        example: 'Japan',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartDto.prototype, "countryOfOrigin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is OEM original part',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePartDto.prototype, "isOem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Is aftermarket part',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePartDto.prototype, "isAftermarket", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePartDto.prototype, "metaValue", void 0);
//# sourceMappingURL=create-part.dto.js.map