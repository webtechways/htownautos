"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtsModule = void 0;
const common_1 = require("@nestjs/common");
const tts_controller_1 = require("./tts.controller");
const tts_service_1 = require("./tts.service");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
let TtsModule = class TtsModule {
};
exports.TtsModule = TtsModule;
exports.TtsModule = TtsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [tts_controller_1.TtsController],
        providers: [tts_service_1.TtsService, common_2.S3Service],
        exports: [tts_service_1.TtsService],
    })
], TtsModule);
//# sourceMappingURL=tts.module.js.map