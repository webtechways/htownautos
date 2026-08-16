"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NomenclatorsModule = void 0;
const common_1 = require("@nestjs/common");
const nomenclators_service_1 = require("./nomenclators.service");
const nomenclators_controller_1 = require("./nomenclators.controller");
const prisma_1 = require("@htownautos/prisma");
const controllers = __importStar(require("./controllers"));
let NomenclatorsModule = class NomenclatorsModule {
};
exports.NomenclatorsModule = NomenclatorsModule;
exports.NomenclatorsModule = NomenclatorsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [
            nomenclators_controller_1.NomenclatorsController,
            controllers.SaleTypesController,
            controllers.MileageStatusesController,
            controllers.VehicleStatusesController,
            controllers.TitleStatusesController,
            controllers.VehicleConditionsController,
            controllers.BrandStatusesController,
            controllers.VehicleTypesController,
            controllers.BodyTypesController,
            controllers.FuelTypesController,
            controllers.DriveTypesController,
            controllers.TransmissionTypesController,
            controllers.VehicleSourcesController,
            controllers.InspectionStatusesController,
            controllers.ActivityTypesController,
            controllers.ActivityStatusesController,
            controllers.LeadSourcesController,
            controllers.InquiryTypesController,
            controllers.PreferredLanguagesController,
            controllers.ContactMethodsController,
            controllers.ContactTimesController,
            controllers.GendersController,
            controllers.IdTypesController,
            controllers.IdStatesController,
            controllers.EmploymentStatusesController,
            controllers.OccupationsController,
            controllers.DealStatusesController,
            controllers.FinanceTypesController,
            controllers.TitleBrandsController,
            controllers.MileageUnitsController,
            controllers.VehicleEnginesController,
        ],
        providers: [nomenclators_service_1.NomenclatorsService],
        exports: [nomenclators_service_1.NomenclatorsService],
    })
], NomenclatorsModule);
//# sourceMappingURL=nomenclators.module.js.map