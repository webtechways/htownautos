"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitleMappingModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const title_mapping_service_1 = require("./title-mapping.service");
const title_mapping_controller_1 = require("./title-mapping.controller");
let TitleMappingModule = class TitleMappingModule {
};
exports.TitleMappingModule = TitleMappingModule;
exports.TitleMappingModule = TitleMappingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [title_mapping_controller_1.TitleMappingController],
        providers: [title_mapping_service_1.TitleMappingService],
        exports: [title_mapping_service_1.TitleMappingService],
    })
], TitleMappingModule);
//# sourceMappingURL=title-mapping.module.js.map