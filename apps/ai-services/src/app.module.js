"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const redis_1 = require("@htownautos/redis");
const rabbitmq_1 = require("@htownautos/rabbitmq");
const auth_1 = require("@htownautos/auth");
const damage_detector_module_1 = require("./damage-detector/damage-detector.module");
const carfax_analyzer_module_1 = require("./carfax-analyzer/carfax-analyzer.module");
const tts_module_1 = require("./tts/tts.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_1.PrismaModule,
            redis_1.RedisModule,
            rabbitmq_1.RabbitMQModule,
            auth_1.AuthModule,
            damage_detector_module_1.DamageDetectorModule,
            carfax_analyzer_module_1.CarfaxAnalyzerModule,
            tts_module_1.TtsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map