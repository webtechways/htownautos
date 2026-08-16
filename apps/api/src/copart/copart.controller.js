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
exports.CopartController = void 0;
const common_1 = require("@nestjs/common");
const copart_service_1 = require("./copart.service");
const query_copart_dto_1 = require("./dto/query-copart.dto");
let CopartController = class CopartController {
    copartService;
    constructor(copartService) {
        this.copartService = copartService;
    }
    async findAll(query) {
        return this.copartService.findAll(query);
    }
    async getFilterOptions() {
        return this.copartService.getFilterOptions();
    }
    async getStats() {
        return this.copartService.getStats();
    }
    async findOne(id) {
        const listing = await this.copartService.findOne(id);
        if (!listing) {
            throw new common_1.NotFoundException(`Copart listing with ID ${id} not found`);
        }
        return listing;
    }
    async findByLotNumber(lotNumber) {
        const listing = await this.copartService.findByLotNumber(lotNumber);
        if (!listing) {
            throw new common_1.NotFoundException(`Copart listing with lot number ${lotNumber} not found`);
        }
        return listing;
    }
};
exports.CopartController = CopartController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_copart_dto_1.QueryCopartDto]),
    __metadata("design:returntype", Promise)
], CopartController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('filters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CopartController.prototype, "getFilterOptions", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CopartController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CopartController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('lot/:lotNumber'),
    __param(0, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CopartController.prototype, "findByLotNumber", null);
exports.CopartController = CopartController = __decorate([
    (0, common_1.Controller)('copart'),
    __metadata("design:paramtypes", [copart_service_1.CopartService])
], CopartController);
//# sourceMappingURL=copart.controller.js.map