"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadSessionModule = void 0;
const common_1 = require("@nestjs/common");
const upload_session_service_1 = require("./upload-session.service");
const upload_session_controller_1 = require("./upload-session.controller");
const upload_session_public_controller_1 = require("./upload-session-public.controller");
const prisma_1 = require("@htownautos/prisma");
const media_1 = require("@htownautos/media");
let UploadSessionModule = class UploadSessionModule {
};
exports.UploadSessionModule = UploadSessionModule;
exports.UploadSessionModule = UploadSessionModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, media_1.MediaModule],
        controllers: [upload_session_controller_1.UploadSessionController, upload_session_public_controller_1.UploadSessionPublicController],
        providers: [upload_session_service_1.UploadSessionService],
    })
], UploadSessionModule);
//# sourceMappingURL=upload-session.module.js.map