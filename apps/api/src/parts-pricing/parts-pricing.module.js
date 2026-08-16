"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartsPricingModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const parts_pricing_service_1 = require("./parts-pricing.service");
const parts_pricing_controller_1 = require("./parts-pricing.controller");
let PartsPricingModule = class PartsPricingModule {
};
exports.PartsPricingModule = PartsPricingModule;
exports.PartsPricingModule = PartsPricingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [parts_pricing_controller_1.PartsPricingController],
        providers: [parts_pricing_service_1.PartsPricingService],
        exports: [parts_pricing_service_1.PartsPricingService],
    })
], PartsPricingModule);
//# sourceMappingURL=parts-pricing.module.js.map