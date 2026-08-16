"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncWatchdogModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const notifications_module_1 = require("../notifications/notifications.module");
const sync_watchdog_service_1 = require("./sync-watchdog.service");
let SyncWatchdogModule = class SyncWatchdogModule {
};
exports.SyncWatchdogModule = SyncWatchdogModule;
exports.SyncWatchdogModule = SyncWatchdogModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, notifications_module_1.NotificationsModule],
        providers: [sync_watchdog_service_1.SyncWatchdogService],
    })
], SyncWatchdogModule);
//# sourceMappingURL=sync-watchdog.module.js.map