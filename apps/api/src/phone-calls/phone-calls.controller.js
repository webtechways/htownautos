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
exports.PhoneCallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const phone_calls_service_1 = require("./phone-calls.service");
const phone_call_service_1 = require("../phone-call/phone-call.service");
const create_phone_call_dto_1 = require("./dto/create-phone-call.dto");
const query_phone_call_dto_1 = require("./dto/query-phone-call.dto");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
let PhoneCallsController = class PhoneCallsController {
    phoneCallsService;
    phoneCallService;
    constructor(phoneCallsService, phoneCallService) {
        this.phoneCallsService = phoneCallsService;
        this.phoneCallService = phoneCallService;
    }
    getTenantUserId(user, tenantId) {
        const tenantUser = user.tenants?.find((t) => t.tenantId === tenantId || t.tenant?.id === tenantId);
        if (!tenantUser) {
            throw new common_1.BadRequestException('User is not a member of this tenant');
        }
        return tenantUser.id;
    }
    create(tenantId, createPhoneCallDto, user) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        return this.phoneCallsService.create(tenantId, createPhoneCallDto, tenantUserId);
    }
    async findAll(tenantId, query, user) {
        const canAccessRecordings = await this.phoneCallsService.canUserAccessRecordings(tenantId, user.id);
        return this.phoneCallsService.findAll(tenantId, query, canAccessRecordings);
    }
    getStats(tenantId, buyerId, callerId) {
        return this.phoneCallsService.getCallStats(tenantId, buyerId, callerId);
    }
    async findByBuyer(tenantId, buyerId, query, user) {
        const canAccessRecordings = await this.phoneCallsService.canUserAccessRecordings(tenantId, user.id);
        return this.phoneCallsService.findByBuyer(tenantId, buyerId, query, canAccessRecordings);
    }
    async findByPhoneNumbers(tenantId, phones, query, user) {
        const phoneNumbers = phones ? phones.split(',').map((p) => p.trim()) : [];
        const canAccessRecordings = await this.phoneCallsService.canUserAccessRecordings(tenantId, user.id);
        return this.phoneCallsService.findByPhoneNumbers(tenantId, phoneNumbers, query, canAccessRecordings);
    }
    async getAvailableTransferTargets(tenantId, user) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        return this.phoneCallService.getAvailableTransferTargets(tenantId, tenantUserId);
    }
    async transferCall(tenantId, callSid, body, user) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        if (!body.targetUserId) {
            throw new common_1.BadRequestException('targetUserId is required');
        }
        return this.phoneCallService.transferCall(callSid, body.targetUserId, tenantUserId, body.reason);
    }
    async findOne(tenantId, id, user) {
        const canAccessRecordings = await this.phoneCallsService.canUserAccessRecordings(tenantId, user.id);
        return this.phoneCallsService.findOne(tenantId, id, canAccessRecordings);
    }
    update(tenantId, id, updatePhoneCallDto) {
        return this.phoneCallsService.update(tenantId, id, updatePhoneCallDto);
    }
    remove(tenantId, id) {
        return this.phoneCallsService.remove(tenantId, id);
    }
    async resegmentTranscription(callSid) {
        const segmentsUpdated = await this.phoneCallService.resegmentTranscription(callSid);
        return {
            success: true,
            segmentsUpdated,
            message: `Transcription re-segmented for ${segmentsUpdated} call segments`,
        };
    }
    async resegmentAllTranscriptions(tenantId) {
        const result = await this.phoneCallService.resegmentAllTranscriptionsForTenant(tenantId);
        return {
            success: true,
            ...result,
            message: `Re-segmented ${result.processed} call chains, ${result.errors} errors`,
        };
    }
};
exports.PhoneCallsController = PhoneCallsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Log a phone call',
        description: 'Records a phone call between a user and a buyer',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Phone call logged successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Buyer not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_phone_call_dto_1.CreatePhoneCallDto, Object]),
    __metadata("design:returntype", void 0)
], PhoneCallsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all phone calls',
        description: 'Retrieves all phone calls for the current tenant with optional filters',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of phone calls' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_phone_call_dto_1.QueryPhoneCallDto, Object]),
    __metadata("design:returntype", Promise)
], PhoneCallsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get call statistics',
        description: 'Retrieves call statistics for the tenant, optionally filtered by buyer or caller',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call statistics' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)('buyerId')),
    __param(2, (0, common_1.Query)('callerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PhoneCallsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('by-buyer/:buyerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get phone calls by buyer',
        description: 'Retrieves all phone calls related to a specific buyer',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of phone calls for the buyer' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, query_phone_call_dto_1.QueryPhoneCallDto, Object]),
    __metadata("design:returntype", Promise)
], PhoneCallsController.prototype, "findByBuyer", null);
__decorate([
    (0, common_1.Get)('by-phone-numbers'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get phone calls by phone numbers',
        description: 'Retrieves all phone calls where fromNumber or toNumber matches any of the provided numbers',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of phone calls matching the phone numbers' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)('phones')),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, query_phone_call_dto_1.QueryPhoneCallDto, Object]),
    __metadata("design:returntype", Promise)
], PhoneCallsController.prototype, "findByPhoneNumbers", null);
__decorate([
    (0, common_1.Get)('transfer/available-users'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available users for call transfer',
        description: 'Returns list of active users in the tenant who can receive transferred calls',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of available transfer targets' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhoneCallsController.prototype, "getAvailableTransferTargets", null);
__decorate([
    (0, common_1.Post)('transfer/:callSid'),
    (0, swagger_1.ApiOperation)({
        summary: 'Transfer an active call',
        description: 'Transfers an active call to another user in the tenant',
    }),
    (0, swagger_1.ApiParam)({ name: 'callSid', description: 'Twilio Call SID of the active call' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call transferred successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Call not found or not active' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('callSid')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], PhoneCallsController.prototype, "transferCall", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get phone call by ID',
        description: 'Retrieves a single phone call by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Phone call UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Phone call found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Phone call not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PhoneCallsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update phone call',
        description: 'Updates a phone call record',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Phone call UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Phone call updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Phone call not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_phone_call_dto_1.UpdatePhoneCallDto]),
    __metadata("design:returntype", void 0)
], PhoneCallsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete phone call',
        description: 'Permanently deletes a phone call record',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Phone call UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Phone call deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Phone call not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PhoneCallsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('resegment-transcription/:callSid'),
    (0, swagger_1.ApiOperation)({
        summary: 'Re-segment transcription for a call with transfers',
        description: 'Re-processes the transcription to split it across transfer segments based on their time ranges. Useful for fixing calls processed before this feature.',
    }),
    (0, swagger_1.ApiParam)({ name: 'callSid', description: 'Any Twilio Call SID in the call chain (original or transfer)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transcription re-segmented successfully' }),
    __param(0, (0, common_1.Param)('callSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PhoneCallsController.prototype, "resegmentTranscription", null);
__decorate([
    (0, common_1.Post)('resegment-all-transcriptions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Re-segment all transcriptions for calls with transfers',
        description: 'Re-processes transcriptions for all calls with transfers in the tenant. This can take a while for tenants with many calls.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All transcriptions re-segmented' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PhoneCallsController.prototype, "resegmentAllTranscriptions", null);
exports.PhoneCallsController = PhoneCallsController = __decorate([
    (0, swagger_1.ApiTags)('Phone Calls'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('phone-calls'),
    __metadata("design:paramtypes", [phone_calls_service_1.PhoneCallsService,
        phone_call_service_1.PhoneCallService])
], PhoneCallsController);
//# sourceMappingURL=phone-calls.controller.js.map