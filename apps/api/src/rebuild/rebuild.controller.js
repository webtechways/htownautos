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
exports.RebuildController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rebuild_service_1 = require("./rebuild.service");
const auth_1 = require("@htownautos/auth");
const class_validator_1 = require("class-validator");
class CreateRebuildItemDto {
    vehicleId;
    side;
    damageDescription;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRebuildItemDto.prototype, "vehicleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRebuildItemDto.prototype, "side", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRebuildItemDto.prototype, "damageDescription", void 0);
class UpdateRebuildItemDto {
    side;
    damageDescription;
    photosBefore;
    photosAfter;
    sortOrder;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRebuildItemDto.prototype, "side", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRebuildItemDto.prototype, "damageDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateRebuildItemDto.prototype, "photosBefore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateRebuildItemDto.prototype, "photosAfter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateRebuildItemDto.prototype, "sortOrder", void 0);
let RebuildController = class RebuildController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findByVehicle(vehicleId) {
        return this.service.findByVehicle(vehicleId);
    }
    async create(tenantId, dto) {
        return this.service.create(dto.vehicleId, { ...dto, tenantId });
    }
    async update(id, dto) {
        return this.service.update(id, dto);
    }
    async remove(id) {
        return this.service.remove(id);
    }
};
exports.RebuildController = RebuildController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get rebuild items for a vehicle' }),
    __param(0, (0, common_1.Query)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RebuildController.prototype, "findByVehicle", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create rebuild item' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateRebuildItemDto]),
    __metadata("design:returntype", Promise)
], RebuildController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update rebuild item' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateRebuildItemDto]),
    __metadata("design:returntype", Promise)
], RebuildController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete rebuild item' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RebuildController.prototype, "remove", null);
exports.RebuildController = RebuildController = __decorate([
    (0, swagger_1.ApiTags)('Rebuild'),
    (0, common_1.Controller)('rebuild-items'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    __metadata("design:paramtypes", [rebuild_service_1.RebuildService])
], RebuildController);
//# sourceMappingURL=rebuild.controller.js.map