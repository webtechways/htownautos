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
exports.PhoneNumberCallFlowController = exports.CallFlowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const call_flow_service_1 = require("./call-flow.service");
const call_flow_dto_1 = require("./dto/call-flow.dto");
let CallFlowController = class CallFlowController {
    callFlowService;
    constructor(callFlowService) {
        this.callFlowService = callFlowService;
    }
    async create(tenantId, dto) {
        return this.callFlowService.create(tenantId, dto);
    }
    async findAll(tenantId) {
        return this.callFlowService.findAll(tenantId);
    }
    async findOne(tenantId, id) {
        return this.callFlowService.findOne(tenantId, id);
    }
    async update(tenantId, id, dto) {
        return this.callFlowService.update(tenantId, id, dto);
    }
    async delete(tenantId, id) {
        return this.callFlowService.delete(tenantId, id);
    }
    async duplicate(tenantId, id, body) {
        return this.callFlowService.duplicate(tenantId, id, body.name);
    }
};
exports.CallFlowController = CallFlowController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new call flow' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Call flow created', type: call_flow_dto_1.CallFlowResponseDto }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, call_flow_dto_1.CreateCallFlowDto]),
    __metadata("design:returntype", Promise)
], CallFlowController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all call flows for tenant' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of call flows', type: [call_flow_dto_1.CallFlowResponseDto] }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallFlowController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a call flow by ID' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Call Flow ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call flow details', type: call_flow_dto_1.CallFlowResponseDto }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CallFlowController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a call flow' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Call Flow ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call flow updated', type: call_flow_dto_1.CallFlowResponseDto }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, call_flow_dto_1.UpdateCallFlowDto]),
    __metadata("design:returntype", Promise)
], CallFlowController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a call flow' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Call Flow ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Call flow deleted' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CallFlowController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate a call flow' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Call Flow ID to duplicate' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Call flow duplicated', type: call_flow_dto_1.CallFlowResponseDto }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CallFlowController.prototype, "duplicate", null);
exports.CallFlowController = CallFlowController = __decorate([
    (0, swagger_1.ApiTags)('Call Flows'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tenants/:tenantId/call-flows'),
    __metadata("design:paramtypes", [call_flow_service_1.CallFlowService])
], CallFlowController);
let PhoneNumberCallFlowController = class PhoneNumberCallFlowController {
    callFlowService;
    constructor(callFlowService) {
        this.callFlowService = callFlowService;
    }
    async assignCallFlow(tenantId, phoneNumberId, dto) {
        return this.callFlowService.assignToPhoneNumber(tenantId, phoneNumberId, dto.callFlowId);
    }
    async removeCallFlow(tenantId, phoneNumberId) {
        return this.callFlowService.assignToPhoneNumber(tenantId, phoneNumberId, null);
    }
};
exports.PhoneNumberCallFlowController = PhoneNumberCallFlowController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a call flow to a phone number' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiParam)({ name: 'phoneNumberId', description: 'Phone Number ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Call flow assigned' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('phoneNumberId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, call_flow_dto_1.AssignCallFlowDto]),
    __metadata("design:returntype", Promise)
], PhoneNumberCallFlowController.prototype, "assignCallFlow", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove call flow from a phone number' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiParam)({ name: 'phoneNumberId', description: 'Phone Number ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Call flow removed' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('phoneNumberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PhoneNumberCallFlowController.prototype, "removeCallFlow", null);
exports.PhoneNumberCallFlowController = PhoneNumberCallFlowController = __decorate([
    (0, swagger_1.ApiTags)('Phone Numbers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tenants/:tenantId/phone-numbers/:phoneNumberId/call-flow'),
    __metadata("design:paramtypes", [call_flow_service_1.CallFlowService])
], PhoneNumberCallFlowController);
//# sourceMappingURL=call-flow.controller.js.map