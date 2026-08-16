"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleModelModule = void 0;
const common_1 = require("@nestjs/common");
const vehicle_model_service_1 = require("./vehicle-model.service");
const vehicle_model_controller_1 = require("./vehicle-model.controller");
const prisma_1 = require("@htownautos/prisma");
const marketcheck_module_1 = require("../marketcheck/marketcheck.module");
let VehicleModelModule = class VehicleModelModule {
};
exports.VehicleModelModule = VehicleModelModule;
exports.VehicleModelModule = VehicleModelModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, marketcheck_module_1.MarketCheckModule],
        controllers: [vehicle_model_controller_1.VehicleModelController],
        providers: [vehicle_model_service_1.VehicleModelService],
        exports: [vehicle_model_service_1.VehicleModelService],
    })
], VehicleModelModule);
//# sourceMappingURL=vehicle-model.module.js.map