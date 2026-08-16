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
exports.ShippoUserParcelTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shippo_service_1 = require("../shippo.service");
let ShippoUserParcelTemplatesController = class ShippoUserParcelTemplatesController {
    shippo;
    constructor(shippo) {
        this.shippo = shippo;
    }
    list() {
        return this.shippo.listUserParcelTemplates();
    }
    create(body) {
        return this.shippo.createUserParcelTemplate(body);
    }
    get(id) {
        return this.shippo.getUserParcelTemplate(id);
    }
    async update(id, body) {
        const existing = (await this.shippo.getUserParcelTemplate(id));
        const pick = (camel, snake) => existing[camel] ?? existing[snake];
        const merged = {
            name: body.name ?? existing.name,
            length: body.length ?? pick('length', 'length'),
            width: body.width ?? pick('width', 'width'),
            height: body.height ?? pick('height', 'height'),
            distanceUnit: (body.distanceUnit ?? pick('distanceUnit', 'distance_unit')),
            weight: body.weight ?? pick('weight', 'weight'),
            weightUnit: (body.weightUnit ?? pick('weightUnit', 'weight_unit')),
        };
        return this.shippo.updateUserParcelTemplate(id, merged);
    }
    remove(id) {
        return this.shippo.deleteUserParcelTemplate(id);
    }
};
exports.ShippoUserParcelTemplatesController = ShippoUserParcelTemplatesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List user parcel templates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShippoUserParcelTemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a user parcel template' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShippoUserParcelTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoUserParcelTemplatesController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShippoUserParcelTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippoUserParcelTemplatesController.prototype, "remove", null);
exports.ShippoUserParcelTemplatesController = ShippoUserParcelTemplatesController = __decorate([
    (0, swagger_1.ApiTags)('Shippo · User Parcel Templates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('shippo/user-parcel-templates'),
    __metadata("design:paramtypes", [shippo_service_1.ShippoService])
], ShippoUserParcelTemplatesController);
//# sourceMappingURL=user-parcel-templates.controller.js.map