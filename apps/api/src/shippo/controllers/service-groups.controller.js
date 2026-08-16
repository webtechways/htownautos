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
exports.ShippoServiceGroupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoServiceGroupsController = class ShippoServiceGroupsController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    list() {
        return this.shippo.listServiceGroups();
    }
    create(body) {
        return this.shippo.createServiceGroup(body);
    }
    update(body) {
        return this.shippo.updateServiceGroup(body);
    }
    remove(id) {
        return this.shippo.deleteServiceGroup(id);
    }
};
exports.ShippoServiceGroupsController = ShippoServiceGroupsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List service groups' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShippoServiceGroupsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a service group' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoServiceGroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a service group (Shippo update takes the object in body)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoServiceGroupsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoServiceGroupsController.prototype, "remove", null);
exports.ShippoServiceGroupsController = ShippoServiceGroupsController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · Service Groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/service-groups'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoServiceGroupsController);
//# sourceMappingURL=service-groups.controller.js.map