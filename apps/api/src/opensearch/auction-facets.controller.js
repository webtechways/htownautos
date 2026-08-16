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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionFacetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auction_facets_service_1 = require("./auction-facets.service");
const auth_1 = require("@htownautos/auth");
let AuctionFacetsController = class AuctionFacetsController {
    service;
    constructor(service) {
        this.service = service;
    }
    makes(yearFrom, yearTo) {
        return this.service.makes({
            yearFrom: yearFrom || undefined,
            yearTo: yearTo || undefined,
        });
    }
    models(make, yearFrom, yearTo) {
        return this.service.models({
            make: (make || '').trim(),
            yearFrom: yearFrom || undefined,
            yearTo: yearTo || undefined,
        });
    }
    trims(make, models, yearFrom, yearTo) {
        const modelList = (models || '')
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean);
        return this.service.trims({
            make: (make || '').trim(),
            models: modelList,
            yearFrom: yearFrom || undefined,
            yearTo: yearTo || undefined,
        });
    }
    colors() {
        return this.service.colors();
    }
    titleTypes() {
        return this.service.titleTypes();
    }
    yearBounds() {
        return this.service.yearBounds();
    }
};
exports.AuctionFacetsController = AuctionFacetsController;
__decorate([
    (0, common_1.Get)('makes'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Distinct makes from active auction listings' }),
    (0, swagger_1.ApiQuery)({ name: 'yearFrom', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'yearTo', required: false, type: Number }),
    __param(0, (0, common_1.Query)('yearFrom', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('yearTo', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AuctionFacetsController.prototype, "makes", null);
__decorate([
    (0, common_1.Get)('models'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Distinct models for a make (optionally filtered by year range)' }),
    (0, swagger_1.ApiQuery)({ name: 'make', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'yearFrom', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'yearTo', required: false, type: Number }),
    __param(0, (0, common_1.Query)('make')),
    __param(1, (0, common_1.Query)('yearFrom', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('yearTo', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuctionFacetsController.prototype, "models", null);
__decorate([
    (0, common_1.Get)('trims'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Distinct trims for a make + models combination',
        description: 'Pass `models` as a comma-separated list (e.g. ?models=Camry,Corolla)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'make', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'models', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'yearFrom', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'yearTo', required: false, type: Number }),
    __param(0, (0, common_1.Query)('make')),
    __param(1, (0, common_1.Query)('models')),
    __param(2, (0, common_1.Query)('yearFrom', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('yearTo', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AuctionFacetsController.prototype, "trims", null);
__decorate([
    (0, common_1.Get)('colors'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Distinct exterior colors from the feed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionFacetsController.prototype, "colors", null);
__decorate([
    (0, common_1.Get)('title-types'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Distinct sale title types from the feed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionFacetsController.prototype, "titleTypes", null);
__decorate([
    (0, common_1.Get)('year-bounds'),
    (0, auth_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Earliest and latest year present in the feed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuctionFacetsController.prototype, "yearBounds", null);
exports.AuctionFacetsController = AuctionFacetsController = __decorate([
    (0, swagger_1.ApiTags)('Auction Facets'),
    (0, common_1.Controller)('auction-facets'),
    __metadata("design:paramtypes", [auction_facets_service_1.AuctionFacetsService])
], AuctionFacetsController);
//# sourceMappingURL=auction-facets.controller.js.map