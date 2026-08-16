"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RebuildModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const rebuild_controller_1 = require("./rebuild.controller");
const rebuild_service_1 = require("./rebuild.service");
let RebuildModule = class RebuildModule {
};
exports.RebuildModule = RebuildModule;
exports.RebuildModule = RebuildModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [rebuild_controller_1.RebuildController],
        providers: [rebuild_service_1.RebuildService],
    })
], RebuildModule);
//# sourceMappingURL=rebuild.module.js.map