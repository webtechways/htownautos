"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingGroupsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const listing_groups_controller_1 = require("./listing-groups.controller");
const listing_groups_service_1 = require("./listing-groups.service");
let ListingGroupsModule = class ListingGroupsModule {
};
exports.ListingGroupsModule = ListingGroupsModule;
exports.ListingGroupsModule = ListingGroupsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [listing_groups_controller_1.ListingGroupsController],
        providers: [listing_groups_service_1.ListingGroupsService],
        exports: [listing_groups_service_1.ListingGroupsService],
    })
], ListingGroupsModule);
//# sourceMappingURL=listing-groups.module.js.map