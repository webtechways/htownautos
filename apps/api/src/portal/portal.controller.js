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
exports.PortalController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("@htownautos/auth");
const portal_service_1 = require("./portal.service");
const stripe_service_1 = require("../stripe/stripe.service");
const buyer_favorites_service_1 = require("../buyer-favorites/buyer-favorites.service");
const receipt_pdf_service_1 = require("./receipt-pdf.service");
const toggle_buyer_favorite_dto_1 = require("../buyer-favorites/dto/toggle-buyer-favorite.dto");
const update_portal_profile_dto_1 = require("./dto/update-portal-profile.dto");
const inspection_cart_dto_1 = require("./dto/inspection-cart.dto");
const create_deposit_dto_1 = require("./dto/create-deposit.dto");
const add_inspection_request_dto_1 = require("./dto/add-inspection-request.dto");
const create_deposit_release_request_dto_1 = require("./dto/create-deposit-release-request.dto");
const find_a_car_checkout_dto_1 = require("./dto/find-a-car-checkout.dto");
const cancel_inspection_dto_1 = require("./dto/cancel-inspection.dto");
let PortalController = class PortalController {
    portalService;
    favoritesService;
    receiptPdfService;
    stripeService;
    constructor(portalService, favoritesService, receiptPdfService, stripeService) {
        this.portalService = portalService;
        this.favoritesService = favoritesService;
        this.receiptPdfService = receiptPdfService;
        this.stripeService = stripeService;
    }
    getMe(buyer) {
        return this.portalService.getProfile(buyer);
    }
    updateMe(buyer, dto) {
        return this.portalService.updateProfile(buyer, dto);
    }
    getInspections(buyer) {
        return this.portalService.getInspections(buyer);
    }
    getInspection(id, buyer) {
        return this.portalService.getInspection(id, buyer);
    }
    addInspectionRequest(id, buyer, dto) {
        return this.portalService.addInspectionRequest(id, buyer, dto.text);
    }
    cancelInspection(id, buyer, dto) {
        return this.portalService.cancelInspection(id, buyer, dto.reason);
    }
    checkoutInspections(buyer, dto) {
        return this.portalService.checkoutInspections(buyer, dto);
    }
    getFavorites(buyer) {
        return this.favoritesService.list(buyer.id, buyer.tenantId);
    }
    async getFavoriteIds(buyer) {
        return { ids: await this.favoritesService.getIds(buyer.id) };
    }
    addFavorite(buyer, dto) {
        return this.favoritesService.add(buyer.id, buyer.tenantId, {
            lotNumber: dto.lotNumber,
            vin: dto.vin,
        });
    }
    removeFavorite(buyer, lotNumber) {
        return this.favoritesService.remove(buyer.id, lotNumber);
    }
    getOrderBySession(buyer, sessionId) {
        return this.portalService.confirmOrderBySession(buyer, sessionId);
    }
    getLedger(buyer) {
        return this.portalService.getLedger(buyer);
    }
    createDeposit(buyer, dto) {
        return this.portalService.createDeposit(buyer, dto);
    }
    checkoutFindACar(buyer, dto) {
        return this.portalService.checkoutFindACar(buyer, dto);
    }
    getPaymentSummary(buyer) {
        return this.stripeService.getPaymentSummary(buyer.id, buyer.tenantId);
    }
    listPaymentMethods(buyer) {
        return this.stripeService.listPaymentMethods(buyer.id, buyer.tenantId);
    }
    listPayments(buyer, startingAfter) {
        return this.stripeService.listPayments(buyer.id, buyer.tenantId, 50, startingAfter);
    }
    createSetupIntent(buyer) {
        return this.stripeService.createSetupIntent(buyer.id, buyer.tenantId);
    }
    detachPaymentMethod(buyer, id) {
        return this.stripeService.detachPaymentMethod(buyer.id, id, buyer.tenantId);
    }
    setDefaultPaymentMethod(buyer, id) {
        return this.stripeService.setDefaultPaymentMethod(buyer.id, id, buyer.tenantId);
    }
    async getOrderReceiptPdf(buyer, orderId, res) {
        const order = await this.portalService.getOrderForBuyer(orderId, buyer);
        const receiptNumber = order.id.slice(0, 8).toUpperCase();
        const bytes = await this.receiptPdfService.buildOrderReceiptPdf(order, {
            buyerName: `${buyer.firstName} ${buyer.lastName}`.trim(),
            buyerEmail: buyer.email ?? '',
            buyerPhone: buyer.phoneMain ?? undefined,
        });
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="recibo-${receiptNumber}.pdf"`,
        });
        res.end(Buffer.from(bytes));
    }
    createDepositReleaseRequest(buyer, dto) {
        return this.portalService.createDepositReleaseRequest(buyer, dto.note);
    }
    getLatestDepositReleaseRequest(buyer) {
        return this.portalService.getLatestDepositReleaseRequest(buyer);
    }
};
exports.PortalController = PortalController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_portal_profile_dto_1.UpdatePortalProfileDto]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Get)('inspections'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getInspections", null);
__decorate([
    (0, common_1.Get)('inspections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getInspection", null);
__decorate([
    (0, common_1.Post)('inspections/:id/requests'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_1.CurrentBuyer)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, add_inspection_request_dto_1.AddInspectionRequestDto]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "addInspectionRequest", null);
__decorate([
    (0, common_1.Post)('inspections/:id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_1.CurrentBuyer)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, cancel_inspection_dto_1.CancelInspectionDto]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "cancelInspection", null);
__decorate([
    (0, common_1.Post)('inspections/checkout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inspection_cart_dto_1.InspectionCartDto]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "checkoutInspections", null);
__decorate([
    (0, common_1.Get)('favorites'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.Get)('favorites/ids'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortalController.prototype, "getFavoriteIds", null);
__decorate([
    (0, common_1.Post)('favorites'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, toggle_buyer_favorite_dto_1.ToggleBuyerFavoriteDto]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "addFavorite", null);
__decorate([
    (0, common_1.Delete)('favorites/:lotNumber'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "removeFavorite", null);
__decorate([
    (0, common_1.Get)('orders/by-session/:sessionId'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getOrderBySession", null);
__decorate([
    (0, common_1.Get)('ledger'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getLedger", null);
__decorate([
    (0, common_1.Post)('deposits'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_deposit_dto_1.CreateDepositDto]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "createDeposit", null);
__decorate([
    (0, common_1.Post)('find-a-car/checkout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, find_a_car_checkout_dto_1.FindACarCheckoutDto]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "checkoutFindACar", null);
__decorate([
    (0, common_1.Get)('payment-summary'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getPaymentSummary", null);
__decorate([
    (0, common_1.Get)('payment-methods'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "listPaymentMethods", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Query)('startingAfter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "listPayments", null);
__decorate([
    (0, common_1.Post)('payment-methods/setup-intent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "createSetupIntent", null);
__decorate([
    (0, common_1.Delete)('payment-methods/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "detachPaymentMethod", null);
__decorate([
    (0, common_1.Post)('payment-methods/:id/default'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "setDefaultPaymentMethod", null);
__decorate([
    (0, common_1.Get)('orders/:orderId/receipt.pdf'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PortalController.prototype, "getOrderReceiptPdf", null);
__decorate([
    (0, common_1.Post)('deposits/release-request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_deposit_release_request_dto_1.CreateDepositReleaseRequestDto]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "createDepositReleaseRequest", null);
__decorate([
    (0, common_1.Get)('deposits/release-request'),
    __param(0, (0, auth_1.CurrentBuyer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getLatestDepositReleaseRequest", null);
exports.PortalController = PortalController = __decorate([
    (0, auth_1.TenantOptional)(),
    (0, common_1.UseGuards)(auth_1.CustomerGuard),
    (0, common_1.Controller)('portal'),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => stripe_service_1.StripeService))),
    __metadata("design:paramtypes", [portal_service_1.PortalService,
        buyer_favorites_service_1.BuyerFavoritesService,
        receipt_pdf_service_1.ReceiptPdfService,
        stripe_service_1.StripeService])
], PortalController);
//# sourceMappingURL=portal.controller.js.map