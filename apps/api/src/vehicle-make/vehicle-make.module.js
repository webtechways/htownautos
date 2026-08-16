"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleMakeModule = void 0;
const common_1 = require("@nestjs/common");
const vehicle_make_service_1 = require("./vehicle-make.service");
const vehicle_make_controller_1 = require("./vehicle-make.controller");
const prisma_1 = require("@htownautos/prisma");
const marketcheck_module_1 = require("../marketcheck/marketcheck.module");
let VehicleMakeModule = class VehicleMakeModule {
};
exports.VehicleMakeModule = VehicleMakeModule;
exports.VehicleMakeModule = VehicleMakeModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, marketcheck_module_1.MarketCheckModule],
        controllers: [vehicle_make_controller_1.VehicleMakeController],
        providers: [vehicle_make_service_1.VehicleMakeService],
        exports: [vehicle_make_service_1.VehicleMakeService],
    })
], VehicleMakeModule);
//# sourceMappingURL=vehicle-make.module.js.map