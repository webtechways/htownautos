"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_controller_1 = require("./tenant.controller");
const tenant_service_1 = require("./tenant.service");
const tenant_email_domain_service_1 = require("./tenant-email-domain.service");
const prisma_1 = require("@htownautos/prisma");
const auth_1 = require("@htownautos/auth");
const notifications_module_1 = require("../notifications/notifications.module");
let TenantModule = class TenantModule {
};
exports.TenantModule = TenantModule;
exports.TenantModule = TenantModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, (0, common_1.forwardRef)(() => auth_1.AuthModule), notifications_module_1.NotificationsModule],
        controllers: [tenant_controller_1.TenantController, tenant_controller_1.InvitationController],
        providers: [tenant_service_1.TenantService, tenant_email_domain_service_1.TenantEmailDomainService],
        exports: [tenant_service_1.TenantService, tenant_email_domain_service_1.TenantEmailDomainService],
    })
], TenantModule);
//# sourceMappingURL=tenant.module.js.map