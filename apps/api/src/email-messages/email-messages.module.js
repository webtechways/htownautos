"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailMessagesModule = void 0;
const common_1 = require("@nestjs/common");
const email_messages_service_1 = require("./email-messages.service");
const email_messages_controller_1 = require("./email-messages.controller");
const email_send_controller_1 = require("./email-send.controller");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
let EmailMessagesModule = class EmailMessagesModule {
};
exports.EmailMessagesModule = EmailMessagesModule;
exports.EmailMessagesModule = EmailMessagesModule = __decorate([
    (0, common_1.Module)({
        controllers: [email_messages_controller_1.EmailMessagesController, email_send_controller_1.EmailSendController],
        providers: [email_messages_service_1.EmailMessagesService, prisma_1.PrismaService, common_2.S3Service],
        exports: [email_messages_service_1.EmailMessagesService],
    })
], EmailMessagesModule);
//# sourceMappingURL=email-messages.module.js.map