"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneCallsModule = void 0;
const common_1 = require("@nestjs/common");
const phone_calls_service_1 = require("./phone-calls.service");
const phone_calls_controller_1 = require("./phone-calls.controller");
const prisma_1 = require("@htownautos/prisma");
const phone_call_module_1 = require("../phone-call/phone-call.module");
let PhoneCallsModule = class PhoneCallsModule {
};
exports.PhoneCallsModule = PhoneCallsModule;
exports.PhoneCallsModule = PhoneCallsModule = __decorate([
    (0, common_1.Module)({
        imports: [phone_call_module_1.PhoneCallModule],
        controllers: [phone_calls_controller_1.PhoneCallsController],
        providers: [phone_calls_service_1.PhoneCallsService, prisma_1.PrismaService],
        exports: [phone_calls_service_1.PhoneCallsService],
    })
], PhoneCallsModule);
//# sourceMappingURL=phone-calls.module.js.map