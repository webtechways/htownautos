"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const api_key_guard_1 = require("./guards/api-key.guard");
const clerk_jwt_guard_1 = require("./guards/clerk-jwt.guard");
const tenant_guard_1 = require("./guards/tenant.guard");
const auth_service_1 = require("./auth.service");
const clerk_service_1 = require("./clerk.service");
const prisma_1 = require("@htownautos/prisma");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        providers: [
            auth_service_1.AuthService,
            clerk_service_1.ClerkService,
            {
                provide: core_1.APP_GUARD,
                useClass: api_key_guard_1.ApiKeyGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: clerk_jwt_guard_1.ClerkJwtGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: tenant_guard_1.TenantGuard,
            },
        ],
        exports: [auth_service_1.AuthService, clerk_service_1.ClerkService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map