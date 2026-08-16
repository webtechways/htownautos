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
exports.SearchAuctionsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class SearchAuctionsDto {
    page = 1;
    limit = 25;
    sortBy = 'createdAt';
    sortOrder = 'desc';
    search;
    source;
    sourceIds;
    ids;
    vin;
    year;
    yearMin;
    yearMax;
    make;
    model;
    bodyType;
    trim;
    yardName;
    sellerName;
    excludeUnknownSellers;
    transmission;
    fuelType;
    drivetrain;
    color;
    cylinders;
    sellerCategory;
    engineSizeMin;
    engineSizeMax;
    zip;
    radiusMiles;
    locationState;
    odometerMin;
    odometerMax;
    odometerBrand;
    damageDescription;
    saleStatus;
    saleTitleType;
    titleCategory;
    hasKeys;
    runsDrives;
    lotCondCode;
    wholesale;
    saleLight;
    priceMin;
    priceMax;
    saleDateFrom;
    saleDateTo;
    carfaxCleanTitle;
    carfax1Owner;
    domMax;
    hasCarfaxReport;
    hasBuyItNow;
    discarded;
    inspectableOnly;
    includeAggregations = false;
}
exports.SearchAuctionsDto = SearchAuctionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 25, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort field',
        enum: ['year', 'make', 'odometer', 'saleDate', 'highBid', 'estRetailValue', 'createdAt', 'dom', 'locationState', 'saleTitleType'],
        default: 'createdAt'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full text search (VIN, make, model, lot number)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by source', enum: ['copart', 'marketcheck'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by source IDs (comma-separated lotNumbers or externalIds)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "sourceIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by listing IDs (comma-separated UUIDs)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "ids", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by VIN' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "vin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "yearMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "yearMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by make (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "make", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by model (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by body type (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "bodyType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by trim (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "trim", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by yard name (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "yardName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by seller name (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "sellerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Exclude listings without a seller name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchAuctionsDto.prototype, "excludeUnknownSellers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by transmission' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "transmission", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by fuel type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "fuelType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by drivetrain (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "drivetrain", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by exterior color (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by cylinder count (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "cylinders", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by Source / seller category (Insurance, Rental, Repo, Other)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "sellerCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum engine size in litres' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "engineSizeMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum engine size in litres' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "engineSizeMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Center ZIP code for radius search' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "zip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Radius in miles around the ZIP code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "radiusMiles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by location state (comma-separated for multiple)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "locationState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum odometer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "odometerMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum odometer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "odometerMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by odometer brand (A=Actual, E=Exempt, N=Not Actual)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "odometerBrand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by damage description (comma-separated)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "damageDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by sale status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "saleStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by sale title type (comma-separated raw codes)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "saleTitleType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by primary title category (comma-separated: clean, nonrepairable, salvage)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "titleCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by has keys (Yes/No)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "hasKeys", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by runs/drives' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "runsDrives", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by lot condition code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "lotCondCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by wholesale (Y/N)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchAuctionsDto.prototype, "wholesale", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by sale light (comma-separated: GREEN LIGHT, YELLOW LIGHT, RED LIGHT)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string')
            return value.split(',');
        return value;
    }),
    __metadata("design:type", Array)
], SearchAuctionsDto.prototype, "saleLight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum estimated retail value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "priceMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum estimated retail value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "priceMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sale date from (YYYYMMDD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "saleDateFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sale date to (YYYYMMDD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "saleDateTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by Carfax clean title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchAuctionsDto.prototype, "carfaxCleanTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by Carfax 1 owner' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchAuctionsDto.prototype, "carfax1Owner", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum days on market' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SearchAuctionsDto.prototype, "domMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter listings that have a Carfax PDF report uploaded' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchAuctionsDto.prototype, "hasCarfaxReport", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter listings that have a Buy-It-Now price (> 0)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchAuctionsDto.prototype, "hasBuyItNow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When true, show only lots marked as discarded. When omitted, show all lots.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchAuctionsDto.prototype, "discarded", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When true, restrict results to lots located in yards that have physicalInspectionAvailable=true' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchAuctionsDto.prototype, "inspectableOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include aggregations in response', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchAuctionsDto.prototype, "includeAggregations", void 0);
//# sourceMappingURL=search-auctions.dto.js.map