"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopartModule = void 0;
const common_1 = require("@nestjs/common");
const copart_controller_1 = require("./copart.controller");
const copart_service_1 = require("./copart.service");
const prisma_1 = require("@htownautos/prisma");
const title_mapping_module_1 = require("../title-mapping/title-mapping.module");
let CopartModule = class CopartModule {
};
exports.CopartModule = CopartModule;
exports.CopartModule = CopartModule = __decorate([
    (0, common_1.Module)({
        imports: [title_mapping_module_1.TitleMappingModule],
        controllers: [copart_controller_1.CopartController],
        providers: [copart_service_1.CopartService, prisma_1.PrismaService],
        exports: [copart_service_1.CopartService],
    })
], CopartModule);
//# sourceMappingURL=copart.module.js.map