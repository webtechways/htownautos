"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerVehiclePreferencesModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const buyer_vehicle_preferences_controller_1 = require("./buyer-vehicle-preferences.controller");
const buyer_vehicle_preferences_service_1 = require("./buyer-vehicle-preferences.service");
let BuyerVehiclePreferencesModule = class BuyerVehiclePreferencesModule {
};
exports.BuyerVehiclePreferencesModule = BuyerVehiclePreferencesModule;
exports.BuyerVehiclePreferencesModule = BuyerVehiclePreferencesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [buyer_vehicle_preferences_controller_1.BuyerVehiclePreferencesController, buyer_vehicle_preferences_controller_1.BuyerMatchExclusionsController],
        providers: [buyer_vehicle_preferences_service_1.BuyerVehiclePreferencesService],
        exports: [buyer_vehicle_preferences_service_1.BuyerVehiclePreferencesService],
    })
], BuyerVehiclePreferencesModule);
//# sourceMappingURL=buyer-vehicle-preferences.module.js.map