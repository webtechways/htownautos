"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitleModule = void 0;
const common_1 = require("@nestjs/common");
const title_service_1 = require("./title.service");
const title_controller_1 = require("./title.controller");
const prisma_1 = require("@htownautos/prisma");
let TitleModule = class TitleModule {
};
exports.TitleModule = TitleModule;
exports.TitleModule = TitleModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [title_controller_1.TitleController],
        providers: [title_service_1.TitleService],
        exports: [title_service_1.TitleService],
    })
], TitleModule);
//# sourceMappingURL=title.module.js.map