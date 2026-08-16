"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YardsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const yards_controller_1 = require("./yards.controller");
const yards_service_1 = require("./yards.service");
let YardsModule = class YardsModule {
};
exports.YardsModule = YardsModule;
exports.YardsModule = YardsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [yards_controller_1.YardsController],
        providers: [yards_service_1.YardsService],
        exports: [yards_service_1.YardsService],
    })
], YardsModule);
//# sourceMappingURL=yards.module.js.map