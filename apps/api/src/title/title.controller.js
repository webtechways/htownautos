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
exports.TitleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const title_service_1 = require("./title.service");
const create_title_dto_1 = require("./dto/create-title.dto");
const update_title_dto_1 = require("./dto/update-title.dto");
const common_2 = require("@htownautos/common");
let TitleController = class TitleController {
    titleService;
    constructor(titleService) {
        this.titleService = titleService;
    }
    async findByVehicle(vehicleId) {
        return this.titleService.findByVehicle(vehicleId);
    }
    async upsert(vehicleId, dto) {
        return this.titleService.upsert(vehicleId, dto);
    }
    async findOne(id) {
        return this.titleService.findOne(id);
    }
    async update(id, dto) {
        return this.titleService.update(id, dto);
    }
};
exports.TitleController = TitleController;
__decorate([
    (0, common_1.Get)('vehicle/:vehicleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the current title for a vehicle' }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Title found or null' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TitleController.prototype, "findByVehicle", null);
__decorate([
    (0, common_1.Post)('vehicle/:vehicleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_2.AuditLog)({
        action: 'update',
        resource: 'title',
        level: 'medium',
        pii: false,
        compliance: ['RouteOne', 'DealerTrack'],
        trackChanges: true,
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create or update the title for a vehicle',
        description: 'Upserts the title record. If a title exists for the vehicle, it updates it. Otherwise creates a new one.',
    }),
    (0, swagger_1.ApiParam)({ name: 'vehicleId', description: 'Vehicle UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Title created or updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_title_dto_1.CreateTitleDto]),
    __metadata("design:returntype", Promise)
], TitleController.prototype, "upsert", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a title by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Title UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Title found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Title not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TitleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_2.AuditLog)({
        action: 'update',
        resource: 'title',
        level: 'medium',
        pii: false,
        compliance: ['RouteOne', 'DealerTrack'],
        trackChanges: true,
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Update a title by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Title UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Title updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Title not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_title_dto_1.UpdateTitleDto]),
    __metadata("design:returntype", Promise)
], TitleController.prototype, "update", null);
exports.TitleController = TitleController = __decorate([
    (0, swagger_1.ApiTags)('Titles'),
    (0, common_1.Controller)('titles'),
    __metadata("design:paramtypes", [title_service_1.TitleService])
], TitleController);
//# sourceMappingURL=title.controller.js.map