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
exports.MarketCheckController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const marketcheck_service_1 = require("./marketcheck.service");
let MarketCheckController = class MarketCheckController {
    marketCheckService;
    constructor(marketCheckService) {
        this.marketCheckService = marketCheckService;
    }
    async getMakes(year) {
        const makes = await this.marketCheckService.getMakes(year);
        return { data: makes };
    }
    async getModels(year, make) {
        const models = await this.marketCheckService.getModels(year, make);
        return { data: models };
    }
    async getTrims(year, make, model) {
        const trims = await this.marketCheckService.getTrims(year, make, model);
        return { data: trims };
    }
    async decodeVin(vin) {
        const result = await this.marketCheckService.decodeVin(vin);
        return { data: result };
    }
    async getPrice(vin, miles, zip, dealerType) {
        const result = await this.marketCheckService.getPrice(vin, parseInt(miles, 10), zip, dealerType || 'independent');
        return { data: result };
    }
    async getComparables(make, model, year, zip) {
        const result = await this.marketCheckService.getComparables(make, model, year, zip);
        return { data: result };
    }
    async getComparablesByVin(vin, zip) {
        const result = await this.marketCheckService.getComparablesByVin(vin, zip);
        return { data: result };
    }
};
exports.MarketCheckController = MarketCheckController;
__decorate([
    (0, common_1.Get)('makes'),
    (0, swagger_1.ApiOperation)({ summary: 'List makes for a given year' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true, example: '2024' }),
    __param(0, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketCheckController.prototype, "getMakes", null);
__decorate([
    (0, common_1.Get)('models'),
    (0, swagger_1.ApiOperation)({ summary: 'List models for a given year and make' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true, example: '2024' }),
    (0, swagger_1.ApiQuery)({ name: 'make', required: true, example: 'Toyota' }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('make')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketCheckController.prototype, "getModels", null);
__decorate([
    (0, common_1.Get)('trims'),
    (0, swagger_1.ApiOperation)({ summary: 'List trims for a given year, make and model' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true, example: '2024' }),
    (0, swagger_1.ApiQuery)({ name: 'make', required: true, example: 'Toyota' }),
    (0, swagger_1.ApiQuery)({ name: 'model', required: true, example: 'Camry' }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('make')),
    __param(2, (0, common_1.Query)('model')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MarketCheckController.prototype, "getTrims", null);
__decorate([
    (0, common_1.Get)('decode/:vin'),
    (0, swagger_1.ApiOperation)({ summary: 'Decode a VIN to get vehicle specifications' }),
    (0, swagger_1.ApiParam)({ name: 'vin', description: '17-character VIN', example: '5TDKK3DC6DS302565' }),
    __param(0, (0, common_1.Param)('vin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketCheckController.prototype, "decodeVin", null);
__decorate([
    (0, common_1.Get)('price'),
    (0, swagger_1.ApiOperation)({ summary: 'Get MarketCheck price prediction for a vehicle' }),
    (0, swagger_1.ApiQuery)({ name: 'vin', required: true, example: '5TDKK3DC6DS302565' }),
    (0, swagger_1.ApiQuery)({ name: 'miles', required: true, example: '123000' }),
    (0, swagger_1.ApiQuery)({ name: 'zip', required: true, example: '77063' }),
    (0, swagger_1.ApiQuery)({ name: 'dealer_type', required: false, example: 'independent' }),
    __param(0, (0, common_1.Query)('vin')),
    __param(1, (0, common_1.Query)('miles')),
    __param(2, (0, common_1.Query)('zip')),
    __param(3, (0, common_1.Query)('dealer_type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MarketCheckController.prototype, "getPrice", null);
__decorate([
    (0, common_1.Get)('comparables'),
    (0, swagger_1.ApiOperation)({ summary: 'Search for comparable active listings nearby' }),
    (0, swagger_1.ApiQuery)({ name: 'make', required: true, example: 'Toyota' }),
    (0, swagger_1.ApiQuery)({ name: 'model', required: true, example: 'Sienna' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true, example: '2013' }),
    (0, swagger_1.ApiQuery)({ name: 'zip', required: true, example: '77063' }),
    __param(0, (0, common_1.Query)('make')),
    __param(1, (0, common_1.Query)('model')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Query)('zip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MarketCheckController.prototype, "getComparables", null);
__decorate([
    (0, common_1.Get)('comparables-by-vin'),
    (0, swagger_1.ApiOperation)({ summary: 'Search for comparable active listings by VIN' }),
    (0, swagger_1.ApiQuery)({ name: 'vin', required: true, example: '5TDKK3DC6DS302565' }),
    (0, swagger_1.ApiQuery)({ name: 'zip', required: true, example: '77063' }),
    __param(0, (0, common_1.Query)('vin')),
    __param(1, (0, common_1.Query)('zip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketCheckController.prototype, "getComparablesByVin", null);
exports.MarketCheckController = MarketCheckController = __decorate([
    (0, swagger_1.ApiTags)('MarketCheck'),
    (0, common_1.Controller)('marketcheck'),
    __metadata("design:paramtypes", [marketcheck_service_1.MarketCheckService])
], MarketCheckController);
//# sourceMappingURL=marketcheck.controller.js.map