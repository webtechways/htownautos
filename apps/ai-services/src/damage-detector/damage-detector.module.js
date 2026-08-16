"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DamageDetectorModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const damage_detector_service_1 = require("./damage-detector.service");
const damage_detector_controller_1 = require("./damage-detector.controller");
let DamageDetectorModule = class DamageDetectorModule {
};
exports.DamageDetectorModule = DamageDetectorModule;
exports.DamageDetectorModule = DamageDetectorModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [damage_detector_controller_1.DamageDetectorController],
        providers: [damage_detector_service_1.DamageDetectorService],
        exports: [damage_detector_service_1.DamageDetectorService],
    })
], DamageDetectorModule);
//# sourceMappingURL=damage-detector.module.js.map