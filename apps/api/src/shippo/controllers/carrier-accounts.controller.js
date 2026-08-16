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
exports.ShippoCarrierAccountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoCarrierAccountsController = class ShippoCarrierAccountsController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    list(carrier, page, results) {
        return this.shippo.listCarrierAccounts({
            carrier,
            page: page ? parseInt(page) : undefined,
            results: results ? parseInt(results) : undefined,
        });
    }
    create(body) {
        return this.shippo.createCarrierAccount(body);
    }
    register(body) {
        return this.shippo.registerCarrierAccount(body);
    }
    registrationStatus(carrier) {
        return this.shippo.getRegistrationStatus(carrier);
    }
    get(id) {
        return this.shippo.getCarrierAccount(id);
    }
    update(id, body) {
        return this.shippo.updateCarrierAccount(id, body);
    }
    oauth2(id, body) {
        return this.shippo.initiateOauth2Signin(id, body.redirectUri, body.state);
    }
};
exports.ShippoCarrierAccountsController = ShippoCarrierAccountsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List carrier accounts' }),
    __param(0, (0, common_1.Query)('carrier')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('results')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ShippoCarrierAccountsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Connect an existing carrier account' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoCarrierAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a Shippo-managed carrier account' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoCarrierAccountsController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('registration-status/:carrier'),
    (0, swagger_1.ApiOperation)({ summary: 'Carrier registration status' }),
    __param(0, (0, common_1.Param)('carrier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoCarrierAccountsController.prototype, "registrationStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve a carrier account' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoCarrierAccountsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a carrier account' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShippoCarrierAccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/oauth2-signin'),
    (0, swagger_1.ApiOperation)({ summary: 'Start an OAuth2 sign-in flow for a carrier account' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShippoCarrierAccountsController.prototype, "oauth2", null);
exports.ShippoCarrierAccountsController = ShippoCarrierAccountsController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Carrier Accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/carrier-accounts'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoCarrierAccountsController);
//# sourceMappingURL=carrier-accounts.controller.js.map