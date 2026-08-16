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
exports.PortalSettingsController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("@htownautos/auth");
const portal_pricing_service_1 = require("./portal-pricing.service");
const update_portal_pricing_dto_1 = require("./dto/update-portal-pricing.dto");
let PortalSettingsController = class PortalSettingsController {
    pricingService;
    constructor(pricingService) {
        this.pricingService = pricingService;
    }
    getPricing(tenantId) {
        return this.pricingService.getPricing(tenantId);
    }
    updatePricing(tenantId, dto) {
        return this.pricingService.setPricing(tenantId, dto);
    }
};
exports.PortalSettingsController = PortalSettingsController;
__decorate([
    (0, common_1.Get)('pricing'),
    (0, auth_1.RequireRoles)('admin'),
    __param(0, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalSettingsController.prototype, "getPricing", null);
__decorate([
    (0, common_1.Patch)('pricing'),
    (0, auth_1.RequireRoles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_portal_pricing_dto_1.UpdatePortalPricingDto]),
    __metadata("design:returntype", void 0)
], PortalSettingsController.prototype, "updatePricing", null);
exports.PortalSettingsController = PortalSettingsController = __decorate([
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard, auth_1.TenantGuard, auth_1.RolesGuard),
    (0, common_1.Controller)('portal-settings'),
    __metadata("design:paramtypes", [portal_pricing_service_1.PortalPricingService])
], PortalSettingsController);
//# sourceMappingURL=portal-settings.controller.js.map