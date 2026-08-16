"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleInspectionsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const vehicle_inspections_controller_1 = require("./vehicle-inspections.controller");
const vehicle_inspections_service_1 = require("./vehicle-inspections.service");
let VehicleInspectionsModule = class VehicleInspectionsModule {
};
exports.VehicleInspectionsModule = VehicleInspectionsModule;
exports.VehicleInspectionsModule = VehicleInspectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [vehicle_inspections_controller_1.VehicleInspectionsController],
        providers: [vehicle_inspections_service_1.VehicleInspectionsService, common_2.S3Service],
        exports: [vehicle_inspections_service_1.VehicleInspectionsService],
    })
], VehicleInspectionsModule);
//# sourceMappingURL=vehicle-inspections.module.js.map