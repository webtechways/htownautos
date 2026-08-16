"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactMessagesController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("@htownautos/auth");
const contact_messages_service_1 = require("./contact-messages.service");
const list_contact_messages_dto_1 = require("./dto/list-contact-messages.dto");
let ContactMessagesController = class ContactMessagesController {
    contactMessagesService;
    constructor(contactMessagesService) {
        this.contactMessagesService = contactMessagesService;
    }
    list(tenantId, query) {
        return this.contactMessagesService.list(tenantId, query);
    }
    markRead(id, tenantId) {
        return this.contactMessagesService.markRead(id, tenantId);
    }
};
exports.ContactMessagesController = ContactMessagesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, list_contact_messages_dto_1.ListContactMessagesDto]),
    __metadata("design:returntype", void 0)
], ContactMessagesController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContactMessagesController.prototype, "markRead", null);
exports.ContactMessagesController = ContactMessagesController = __decorate([
    (0, common_1.Controller)('contact-messages'),
    __metadata("design:paramtypes", [contact_messages_service_1.ContactMessagesService])
], ContactMessagesController);
//# sourceMappingURL=contact-messages.controller.js.map