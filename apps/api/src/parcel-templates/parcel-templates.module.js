"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelTemplatesModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const shippo_module_1 = require("../shippo/shippo.module");
const parcel_templates_controller_1 = require("./parcel-templates.controller");
const parcel_templates_service_1 = require("./parcel-templates.service");
let ParcelTemplatesModule = class ParcelTemplatesModule {
};
exports.ParcelTemplatesModule = ParcelTemplatesModule;
exports.ParcelTemplatesModule = ParcelTemplatesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, shippo_module_1.ShippoModule],
        controllers: [parcel_templates_controller_1.ParcelTemplatesController],
        providers: [parcel_templates_service_1.ParcelTemplatesService],
        exports: [parcel_templates_service_1.ParcelTemplatesService],
    })
], ParcelTemplatesModule);
//# sourceMappingURL=parcel-templates.module.js.map