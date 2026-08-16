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
exports.SmsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sms_service_1 = require("./sms.service");
const create_sms_dto_1 = require("./dto/create-sms.dto");
const send_sms_dto_1 = require("./dto/send-sms.dto");
const query_sms_dto_1 = require("./dto/query-sms.dto");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
let SmsController = class SmsController {
    smsService;
    constructor(smsService) {
        this.smsService = smsService;
    }
    getTenantUserId(user, tenantId) {
        const tenantUser = user.tenants?.find((t) => t.tenantId === tenantId || t.tenant?.id === tenantId);
        if (!tenantUser) {
            throw new common_1.BadRequestException('User is not a member of this tenant');
        }
        return tenantUser.id;
    }
    create(tenantId, createSmsDto, user) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        return this.smsService.create(tenantId, createSmsDto, tenantUserId);
    }
    sendSms(tenantId, sendSmsDto, user) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        return this.smsService.sendSms(tenantId, tenantUserId, sendSmsDto);
    }
    findAll(tenantId, query) {
        return this.smsService.findAll(tenantId, query);
    }
    getStats(tenantId, buyerId, senderId) {
        return this.smsService.getSmsStats(tenantId, buyerId, senderId);
    }
    findByBuyer(tenantId, buyerId, query) {
        return this.smsService.findByBuyer(tenantId, buyerId, query);
    }
    getConversation(tenantId, buyerId, query) {
        return this.smsService.getConversation(tenantId, buyerId, query);
    }
    findOne(tenantId, id) {
        return this.smsService.findOne(tenantId, id);
    }
    update(tenantId, id, updateSmsDto) {
        return this.smsService.update(tenantId, id, updateSmsDto);
    }
    markAsRead(tenantId, id) {
        return this.smsService.markAsRead(tenantId, id);
    }
    markAllAsRead(tenantId, buyerId) {
        return this.smsService.markAllAsRead(tenantId, buyerId);
    }
    remove(tenantId, id) {
        return this.smsService.remove(tenantId, id);
    }
};
exports.SmsController = SmsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create SMS record',
        description: 'Creates an SMS message record (does not send via Twilio)',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'SMS message created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Buyer not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_sms_dto_1.CreateSmsDto, Object]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send an SMS message',
        description: 'Sends an SMS message to a buyer via Twilio and stores the record',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'SMS sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Failed to send SMS' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Buyer not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, send_sms_dto_1.SendSmsDto, Object]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "sendSms", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all SMS messages',
        description: 'Retrieves all SMS messages for the current tenant with optional filters',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of SMS messages' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_sms_dto_1.QuerySmsDto]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get SMS statistics',
        description: 'Retrieves SMS statistics for the tenant, optionally filtered by buyer or sender',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMS statistics' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)('buyerId')),
    __param(2, (0, common_1.Query)('senderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('by-buyer/:buyerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get SMS messages by buyer',
        description: 'Retrieves all SMS messages related to a specific buyer',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of SMS messages for the buyer' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, query_sms_dto_1.QuerySmsDto]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "findByBuyer", null);
__decorate([
    (0, common_1.Get)('conversation/:buyerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get conversation with buyer',
        description: 'Retrieves all SMS messages in a conversation with a specific buyer (chronological order)',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation messages' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, query_sms_dto_1.QuerySmsDto]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get SMS message by ID',
        description: 'Retrieves a single SMS message by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'SMS message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMS message found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'SMS message not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update SMS message',
        description: 'Updates an SMS message record',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'SMS message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMS message updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'SMS message not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_sms_dto_1.UpdateSmsDto]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark SMS as read',
        description: 'Marks an SMS message as read',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'SMS message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMS message marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'SMS message not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('by-buyer/:buyerId/read-all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark all SMS as read for a buyer',
        description: 'Marks all unread SMS messages from a buyer as read',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All messages marked as read' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete SMS message',
        description: 'Permanently deletes an SMS message record',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'SMS message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMS message deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'SMS message not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SmsController.prototype, "remove", null);
exports.SmsController = SmsController = __decorate([
    (0, swagger_1.ApiTags)('SMS Messages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sms'),
    __metadata("design:paramtypes", [sms_service_1.SmsService])
], SmsController);
//# sourceMappingURL=sms.controller.js.map