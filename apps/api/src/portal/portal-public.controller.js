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
exports.PortalPublicController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("@htownautos/auth");
const portal_service_1 = require("./portal.service");
const portal_pricing_service_1 = require("./portal-pricing.service");
const query_copart_dto_1 = require("../copart/dto/query-copart.dto");
const inspection_cart_dto_1 = require("./dto/inspection-cart.dto");
const portal_filters_query_dto_1 = require("./dto/portal-filters-query.dto");
const contact_form_dto_1 = require("./dto/contact-form.dto");
let PortalPublicController = class PortalPublicController {
    portalService;
    pricingService;
    constructor(portalService, pricingService) {
        this.portalService = portalService;
        this.pricingService = pricingService;
    }
    getFilters(query) {
        return this.portalService.getPortalFilters({
            year: query.year,
            make: query.make,
            model: query.model,
            trim: query.trim,
        });
    }
    getListings(query) {
        return this.portalService.getListings(query);
    }
    getListingGallery(lotNumber) {
        return this.portalService.getListingGallery(lotNumber);
    }
    getListingByLotNumber(lotNumber) {
        return this.portalService.getListingByLotNumber(lotNumber);
    }
    getPricing() {
        return this.pricingService.getPricing(auth_1.PORTAL_TENANT_ID);
    }
    quote(dto) {
        return this.portalService.quotePublic(dto);
    }
    submitContact(dto) {
        return this.portalService.submitContactForm(dto);
    }
};
exports.PortalPublicController = PortalPublicController;
__decorate([
    (0, common_1.Get)('filters'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [portal_filters_query_dto_1.PortalFiltersQueryDto]),
    __metadata("design:returntype", void 0)
], PortalPublicController.prototype, "getFilters", null);
__decorate([
    (0, common_1.Get)('listings'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_copart_dto_1.QueryCopartDto]),
    __metadata("design:returntype", void 0)
], PortalPublicController.prototype, "getListings", null);
__decorate([
    (0, common_1.Get)('listings/:lotNumber/gallery'),
    __param(0, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalPublicController.prototype, "getListingGallery", null);
__decorate([
    (0, common_1.Get)('listings/:lotNumber'),
    __param(0, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalPublicController.prototype, "getListingByLotNumber", null);
__decorate([
    (0, common_1.Get)('pricing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PortalPublicController.prototype, "getPricing", null);
__decorate([
    (0, common_1.Post)('inspections/quote'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inspection_cart_dto_1.InspectionCartDto]),
    __metadata("design:returntype", void 0)
], PortalPublicController.prototype, "quote", null);
__decorate([
    (0, common_1.Post)('contact'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_form_dto_1.ContactFormDto]),
    __metadata("design:returntype", void 0)
], PortalPublicController.prototype, "submitContact", null);
exports.PortalPublicController = PortalPublicController = __decorate([
    (0, auth_1.Public)(),
    (0, auth_1.TenantOptional)(),
    (0, common_1.Controller)('portal'),
    __metadata("design:paramtypes", [portal_service_1.PortalService,
        portal_pricing_service_1.PortalPricingService])
], PortalPublicController);
//# sourceMappingURL=portal-public.controller.js.map