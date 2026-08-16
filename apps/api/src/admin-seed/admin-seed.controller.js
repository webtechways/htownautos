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
exports.AdminSeedController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("@htownautos/auth");
const admin_seed_service_1 = require("./admin-seed.service");
let AdminSeedController = class AdminSeedController {
    service;
    constructor(service) {
        this.service = service;
    }
    seedBuyers(tenantId, body) {
        return this.service.seedBuyers(tenantId, body?.count ?? 65, body?.daysBack ?? 60);
    }
    deleteBuyers(tenantId) {
        return this.service.deleteSeedBuyers(tenantId);
    }
};
exports.AdminSeedController = AdminSeedController;
__decorate([
    (0, common_1.Post)('buyers'),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminSeedController.prototype, "seedBuyers", null);
__decorate([
    (0, common_1.Delete)('buyers'),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminSeedController.prototype, "deleteBuyers", null);
exports.AdminSeedController = AdminSeedController = __decorate([
    (0, common_1.Controller)('admin-seed'),
    __metadata("design:paramtypes", [admin_seed_service_1.AdminSeedService])
], AdminSeedController);
//# sourceMappingURL=admin-seed.controller.js.map