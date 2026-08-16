"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartOrdersModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const shippo_module_1 = require("../shippo/shippo.module");
const stripe_module_1 = require("../stripe/stripe.module");
const part_orders_controller_1 = require("./part-orders.controller");
const part_orders_service_1 = require("./part-orders.service");
let PartOrdersModule = class PartOrdersModule {
};
exports.PartOrdersModule = PartOrdersModule;
exports.PartOrdersModule = PartOrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, shippo_module_1.ShippoModule, (0, common_1.forwardRef)(() => stripe_module_1.StripeModule)],
        controllers: [part_orders_controller_1.PartOrdersController],
        providers: [part_orders_service_1.PartOrdersService],
        exports: [part_orders_service_1.PartOrdersService],
    })
], PartOrdersModule);
//# sourceMappingURL=part-orders.module.js.map