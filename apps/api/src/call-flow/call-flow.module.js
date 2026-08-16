"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallFlowModule = void 0;
const common_1 = require("@nestjs/common");
const call_flow_service_1 = require("./call-flow.service");
const twiml_generator_service_1 = require("./twiml-generator.service");
const call_flow_controller_1 = require("./call-flow.controller");
const prisma_1 = require("@htownautos/prisma");
const tts_1 = require("@htownautos/tts");
let CallFlowModule = class CallFlowModule {
};
exports.CallFlowModule = CallFlowModule;
exports.CallFlowModule = CallFlowModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, tts_1.TtsModule],
        controllers: [call_flow_controller_1.CallFlowController, call_flow_controller_1.PhoneNumberCallFlowController],
        providers: [call_flow_service_1.CallFlowService, twiml_generator_service_1.TwimlGeneratorService],
        exports: [call_flow_service_1.CallFlowService, twiml_generator_service_1.TwimlGeneratorService],
    })
], CallFlowModule);
//# sourceMappingURL=call-flow.module.js.map