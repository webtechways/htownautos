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
exports.ShippoRefundsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoRefundsController = class ShippoRefundsController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    list(page, results) {
        return this.shippo.listRefunds({
            page: page ? parseInt(page) : undefined,
            results: results ? parseInt(results) : undefined,
        });
    }
    create(body) {
        const tx = body.transactionId ?? body.transaction;
        if (!tx) {
            throw new common_1.BadRequestException('Missing required field: transactionId (or transaction)');
        }
        return this.shippo.refundLabel(tx);
    }
    get(id) {
        return this.shippo.getRefund(id);
    }
};
exports.ShippoRefundsController = ShippoRefundsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List refunds' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('results')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShippoRefundsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Refund / void a label by transaction id' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoRefundsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve a refund' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoRefundsController.prototype, "get", null);
exports.ShippoRefundsController = ShippoRefundsController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Refunds'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/refunds'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoRefundsController);
//# sourceMappingURL=refunds.controller.js.map