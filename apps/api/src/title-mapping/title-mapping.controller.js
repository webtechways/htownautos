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
exports.TitleMappingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_1 = require("@htownautos/auth");
const title_mapping_service_1 = require("./title-mapping.service");
const assign_title_mapping_dto_1 = require("./dto/assign-title-mapping.dto");
let TitleMappingController = class TitleMappingController {
    service;
    constructor(service) {
        this.service = service;
    }
    list() {
        return this.service.list();
    }
    assign(dto, userId) {
        return this.service.setMapping(dto.code, dto.category, userId ?? null);
    }
    async remove(code) {
        await this.service.removeMapping(code);
    }
};
exports.TitleMappingController = TitleMappingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all learned title-code → category mappings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TitleMappingController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Assign an (unknown) title code to a category' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_title_mapping_dto_1.AssignTitleMappingDto, String]),
    __metadata("design:returntype", void 0)
], TitleMappingController.prototype, "assign", null);
__decorate([
    (0, common_1.Delete)(':code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a mapping (code reverts to unknown)' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TitleMappingController.prototype, "remove", null);
exports.TitleMappingController = TitleMappingController = __decorate([
    (0, swagger_1.ApiTags)('Auction title mappings'),
    (0, common_1.Controller)('auctions/title-mappings'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [title_mapping_service_1.TitleMappingService])
], TitleMappingController);
//# sourceMappingURL=title-mapping.controller.js.map