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
exports.CreateVehicleDto = exports.VehicleMetaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class VehicleMetaDto {
    key;
    value;
    valueType;
    description;
    isPublic;
}
exports.VehicleMetaDto = VehicleMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Meta key', example: 'custom_field_1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleMetaDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Meta value', example: 'Some value' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleMetaDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Value type', example: 'string', default: 'string' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleMetaDto.prototype, "valueType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleMetaDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is public', default: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], VehicleMetaDto.prototype, "isPublic", void 0);
class CreateVehicleDto {
    vin;
    stockNumber;
    yearId;
    makeId;
    modelId;
    trimId;
    mileage;
    mileageUnitId;
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
    titleBrandId;
    costPrice;
    listPrice;
    salePrice;
    vehicleCost;
    purchaseDate;
    askingPrice;
    advertisingPrice;
    specialPrice;
    specialPriceStartDate;
    specialPriceEndDate;
    msrp;
    minDownType;
    minDownPercent;
    minDownAmount;
    minDepositType;
    minDepositPercent;
    minDepositAmount;
    wholesalePrice;
    floorPrice;
    buyNowPrice;
    startBid;
    startBidEqualsFloor;
    bidIncrement;
    engineId;
    engine;
    cylinders;
    doors;
    passengers;
    description;
    features;
    notes;
    mainImageId;
    metaValue;
    metas;
}
exports.CreateVehicleDto = CreateVehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle Identification Number (VIN) - must be unique',
        example: '1HGBH41JXMN109186',
        minLength: 17,
        maxLength: 17,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(17),
    (0, class_validator_1.Matches)(/^[A-HJ-NPR-Z0-9]{17}$/, {
        message: 'VIN must be 17 characters and contain only valid VIN characters',
    }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal stock number - must be unique if provided',
        example: 'STK-2024-001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "stockNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle year ID (foreign key)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "yearId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle make ID (foreign key)',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "makeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle model ID (foreign key)',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "modelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle trim ID (foreign key)',
        example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "trimId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle mileage in miles (must be 0 or greater)',
        example: 50000,
        minimum: 0,
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mileage is required' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: 'Mileage must be at least 0' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "mileage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mileage unit ID (foreign key)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "mileageUnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Exterior color',
        example: 'Black',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "exteriorColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Interior color',
        example: 'Beige',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "interiorColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle type ID (nomenclator)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'vehicleTypeId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "vehicleTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Body type ID (nomenclator)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'bodyTypeId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "bodyTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fuel type ID (nomenclator)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'fuelTypeId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "fuelTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Drive type ID (nomenclator)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'driveTypeId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "driveTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transmission type ID (nomenclator)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'transmissionTypeId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "transmissionTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle condition ID (nomenclator)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'vehicleConditionId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "vehicleConditionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle status ID (nomenclator)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'vehicleStatusId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "vehicleStatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle source ID (nomenclator)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'sourceId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "sourceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Title brand ID (nomenclator)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'titleBrandId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "titleBrandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cost price (what we paid for it)',
        example: 15000.5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "costPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'List price (MSRP)',
        example: 22000.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "listPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sale price (current selling price)',
        example: 19500.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "salePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vehicle cost (what was paid)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "vehicleCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateVehicleDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Asking price (main retail price)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "askingPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Advertising price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "advertisingPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Special price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "specialPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Special price start date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateVehicleDto.prototype, "specialPriceStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Special price end date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateVehicleDto.prototype, "specialPriceEndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'MSRP' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "msrp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Min down type: percent or fixed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "minDownType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Min down percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "minDownPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Min down amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "minDownAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Min deposit type: percent or fixed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "minDepositType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Min deposit percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "minDepositPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Min deposit amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "minDepositAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Wholesale price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "wholesalePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Floor price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "floorPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Buy now price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "buyNowPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start bid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "startBid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start bid equals floor price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateVehicleDto.prototype, "startBidEqualsFloor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bid increment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "bidIncrement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Engine ID (from vehicle_engines nomenclator)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "engineId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Engine description',
        example: '2.5L 4-Cylinder',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "engine", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of cylinders (1-16)',
        example: 4,
        minimum: 1,
        maximum: 16,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(16),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "cylinders", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of doors (1-6)',
        example: 4,
        minimum: 1,
        maximum: 6,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "doors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Passenger capacity (1-100)',
        example: 5,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "passengers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle description',
        example: 'Excellent condition, fully loaded with premium features',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vehicle features (JSON string or text)',
        example: 'Navigation, Leather Seats, Sunroof, Backup Camera',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal notes (not visible to customers)',
        example: 'Customer requested specific inspection. Check brakes.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Main image ID',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'mainImageId must be a valid UUID' }),
    (0, class_transformer_1.Transform)(({ value }) => value === '' || value === null ? undefined : value),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "mainImageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata as JSON',
        example: { customField1: 'value1', customField2: 'value2' },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "metaValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of metadata entries to create with this vehicle',
        type: [VehicleMetaDto],
        example: [
            { key: 'custom_field_1', value: 'value1', valueType: 'string' },
            { key: 'carfax_report_id', value: '12345', valueType: 'string' },
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VehicleMetaDto),
    __metadata("design:type", Array)
], CreateVehicleDto.prototype, "metas", void 0);
//# sourceMappingURL=create-vehicle.dto.js.map