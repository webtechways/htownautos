"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSeedModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const admin_seed_controller_1 = require("./admin-seed.controller");
const admin_seed_service_1 = require("./admin-seed.service");
let AdminSeedModule = class AdminSeedModule {
};
exports.AdminSeedModule = AdminSeedModule;
exports.AdminSeedModule = AdminSeedModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [admin_seed_controller_1.AdminSeedController],
        providers: [admin_seed_service_1.AdminSeedService],
    })
], AdminSeedModule);
//# sourceMappingURL=admin-seed.module.js.map