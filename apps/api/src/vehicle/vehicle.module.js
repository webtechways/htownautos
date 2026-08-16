"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleModule = void 0;
const common_1 = require("@nestjs/common");
const vehicle_service_1 = require("./vehicle.service");
const vehicle_controller_1 = require("./vehicle.controller");
const vehicle_public_controller_1 = require("./vehicle-public.controller");
const vehicle_parts_controller_1 = require("./vehicle-parts.controller");
const vehicle_parts_service_1 = require("./vehicle-parts.service");
const prisma_1 = require("@htownautos/prisma");
const meta_module_1 = require("../meta/meta.module");
let VehicleModule = class VehicleModule {
};
exports.VehicleModule = VehicleModule;
exports.VehicleModule = VehicleModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, meta_module_1.MetaModule],
        controllers: [vehicle_controller_1.VehicleController, vehicle_public_controller_1.VehiclePublicController, vehicle_parts_controller_1.VehiclePartsController],
        providers: [vehicle_service_1.VehicleService, vehicle_parts_service_1.VehiclePartsService],
        exports: [vehicle_service_1.VehicleService, vehicle_parts_service_1.VehiclePartsService],
    })
], VehicleModule);
//# sourceMappingURL=vehicle.module.js.map