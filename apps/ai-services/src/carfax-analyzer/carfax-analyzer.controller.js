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
exports.CarfaxAnalyzerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const carfax_analyzer_service_1 = require("./carfax-analyzer.service");
const common_2 = require("@htownautos/common");
class UploadCarfaxDto {
    auctionListingId;
    s3Key;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auction listing ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadCarfaxDto.prototype, "auctionListingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'S3 key of the uploaded PDF' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadCarfaxDto.prototype, "s3Key", void 0);
class FetchCarfaxDto {
    auctionListingId;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Auction listing ID (lot number)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FetchCarfaxDto.prototype, "auctionListingId", void 0);
let CarfaxAnalyzerController = class CarfaxAnalyzerController {
    carfaxAnalyzerService;
    s3Service;
    constructor(carfaxAnalyzerService, s3Service) {
        this.carfaxAnalyzerService = carfaxAnalyzerService;
        this.s3Service = s3Service;
    }
    async fetchFromProvider(dto) {
        const result = await this.carfaxAnalyzerService.fetchCarfaxFromProvider(dto.auctionListingId);
        return { data: result };
    }
    async upload(dto) {
        const result = await this.carfaxAnalyzerService.uploadReport(dto.auctionListingId, dto.s3Key);
        return { data: result };
    }
    async analyze(reportId) {
        const result = await this.carfaxAnalyzerService.analyzeReport(reportId);
        return { data: result };
    }
    async summarize(reportId) {
        const result = await this.carfaxAnalyzerService.summarizeReport(reportId);
        return { data: { id: result.id, aiSummary: result.aiSummary } };
    }
    async getDownloadUrl(key, expiresIn) {
        const ttl = expiresIn ? parseInt(expiresIn, 10) : 3600;
        const url = await this.s3Service.getSignedUrl(key, ttl);
        return { url };
    }
    async getLimits() {
        const data = await this.carfaxAnalyzerService.getProviderLimits();
        return { data };
    }
    async batchCheck(body) {
        const idsWithReports = await this.carfaxAnalyzerService.batchCheckHasReports(body.ids || []);
        return { data: idsWithReports };
    }
    async getByVehicle(vin, lotNumber) {
        const reports = await this.carfaxAnalyzerService.getReportsByVehicle({
            vin: vin || null,
            lotNumber: lotNumber || null,
        });
        return { data: reports };
    }
    async getReports(auctionListingId) {
        const reports = await this.carfaxAnalyzerService.getReports(auctionListingId);
        return { data: reports };
    }
};
exports.CarfaxAnalyzerController = CarfaxAnalyzerController;
__decorate([
    (0, common_1.Post)('fetch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch a Carfax HTML report from the CheapCarfax provider, store in S3, and return a signed URL',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FetchCarfaxDto]),
    __metadata("design:returntype", Promise)
], CarfaxAnalyzerController.prototype, "fetchFromProvider", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Register an uploaded Carfax PDF (no AI analysis yet)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UploadCarfaxDto]),
    __metadata("design:returntype", Promise)
], CarfaxAnalyzerController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)(':reportId/analyze'),
    (0, swagger_1.ApiOperation)({ summary: 'Run AI analysis on an existing Carfax report' }),
    (0, swagger_1.ApiParam)({ name: 'reportId', description: 'Carfax report ID' }),
    __param(0, (0, common_1.Param)('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CarfaxAnalyzerController.prototype, "analyze", null);
__decorate([
    (0, common_1.Post)(':reportId/summarize'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate a structured AI summary of an existing Carfax report and store in aiSummary',
    }),
    (0, swagger_1.ApiParam)({ name: 'reportId', description: 'Carfax report ID' }),
    __param(0, (0, common_1.Param)('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CarfaxAnalyzerController.prototype, "summarize", null);
__decorate([
    (0, common_1.Get)('download'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a signed download URL for a Carfax PDF' }),
    (0, swagger_1.ApiQuery)({ name: 'key', required: true, description: 'S3 key of the PDF' }),
    (0, swagger_1.ApiQuery)({ name: 'expiresIn', required: false, description: 'URL expiration in seconds' }),
    __param(0, (0, common_1.Query)('key')),
    __param(1, (0, common_1.Query)('expiresIn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CarfaxAnalyzerController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Get)('limits'),
    (0, swagger_1.ApiOperation)({ summary: 'Remaining Carfax reports / credits from the CheapCarfax provider' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CarfaxAnalyzerController.prototype, "getLimits", null);
__decorate([
    (0, common_1.Post)('batch-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Batch check which auction listing IDs have Carfax reports' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarfaxAnalyzerController.prototype, "batchCheck", null);
__decorate([
    (0, common_1.Get)('by-vehicle'),
    (0, swagger_1.ApiOperation)({
        summary: 'Find Carfax reports for a vehicle by VIN and/or lot number (returns the union).',
    }),
    (0, swagger_1.ApiQuery)({ name: 'vin', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'lotNumber', required: false }),
    __param(0, (0, common_1.Query)('vin')),
    __param(1, (0, common_1.Query)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CarfaxAnalyzerController.prototype, "getByVehicle", null);
__decorate([
    (0, common_1.Get)(':auctionListingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get existing Carfax reports for an auction listing' }),
    (0, swagger_1.ApiParam)({ name: 'auctionListingId', description: 'Auction listing ID' }),
    __param(0, (0, common_1.Param)('auctionListingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CarfaxAnalyzerController.prototype, "getReports", null);
exports.CarfaxAnalyzerController = CarfaxAnalyzerController = __decorate([
    (0, swagger_1.ApiTags)('Carfax Analyzer'),
    (0, common_1.Controller)('carfax-analyzer'),
    __metadata("design:paramtypes", [carfax_analyzer_service_1.CarfaxAnalyzerService,
        common_2.S3Service])
], CarfaxAnalyzerController);
//# sourceMappingURL=carfax-analyzer.controller.js.map