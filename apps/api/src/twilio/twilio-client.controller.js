"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TwilioClientController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioClientController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const express = __importStar(require("express"));
const twilio = __importStar(require("twilio"));
const twilio_service_1 = require("./twilio.service");
const auth_1 = require("@htownautos/auth");
const prisma_1 = require("@htownautos/prisma");
const auth_2 = require("@htownautos/auth");
const auth_3 = require("@htownautos/auth");
const auth_4 = require("@htownautos/auth");
const phone_call_service_1 = require("../phone-call/phone-call.service");
const VoiceResponse = twilio.twiml.VoiceResponse;
let TwilioClientController = TwilioClientController_1 = class TwilioClientController {
    twilioService;
    prisma;
    phoneCallService;
    logger = new common_1.Logger(TwilioClientController_1.name);
    constructor(twilioService, prisma, phoneCallService) {
        this.twilioService = twilioService;
        this.prisma = prisma;
        this.phoneCallService = phoneCallService;
    }
    async getVoiceToken(user, tenantId) {
        if (!user?.id || !tenantId) {
            this.logger.error(`Missing auth data - userId: ${user?.id}, tenantId: ${tenantId}`);
            throw new Error('User must be authenticated with a tenant selected');
        }
        const result = this.twilioService.generateVoiceToken(user.id, tenantId);
        this.logger.log(`Generated voice token for user ${user.id} (${user.email}) in tenant ${tenantId}`);
        return {
            token: result.token,
            identity: result.identity,
            expiresIn: 3600,
        };
    }
    parseClientIdentity(clientIdentity) {
        if (!clientIdentity) {
            return { tenantId: null, userId: null };
        }
        const identity = clientIdentity.startsWith('client:')
            ? clientIdentity.replace('client:', '')
            : clientIdentity;
        const colonIndex = identity.indexOf(':');
        if (colonIndex > 0) {
            const tenantId = identity.substring(0, colonIndex);
            const userId = identity.substring(colonIndex + 1);
            if (tenantId && userId) {
                this.logger.log(`Parsed client identity - tenantId: ${tenantId}, userId: ${userId}`);
                return { tenantId, userId };
            }
        }
        this.logger.warn(`Could not parse client identity: ${clientIdentity}`);
        return { tenantId: null, userId: null };
    }
    async handleOutgoingCall(body, res) {
        this.logger.log(`Outgoing call request - From: ${body.From}, To: ${body.To}, CallerId: ${body.CallerId}, TenantId: ${body.TenantId}, CallSid: ${body.CallSid}`);
        const response = new VoiceResponse();
        const to = body.To;
        const callSid = body.CallSid;
        const parsed = this.parseClientIdentity(body.From);
        let tenantId = body.TenantId || parsed.tenantId || '';
        const userId = parsed.userId;
        this.logger.log(`Parsed client identity - tenantId: ${tenantId}, userId: ${userId}`);
        if (!to) {
            this.logger.warn('Outgoing call failed: No destination specified');
            response.say({ voice: 'alice' }, 'No destination specified.');
            response.hangup();
        }
        else if (to.startsWith('client:')) {
            const dial = response.dial({
                callerId: body.From,
            });
            dial.client(to.replace('client:', ''));
        }
        else {
            let callerId = body.CallerId;
            if (!callerId || !callerId.startsWith('+') || callerId.includes('@')) {
                this.logger.warn(`Invalid CallerId: ${callerId}, attempting to find a valid number`);
                try {
                    let phoneNumberRecord = null;
                    if (tenantId) {
                        phoneNumberRecord = await this.prisma.twilioPhoneNumber.findFirst({
                            where: { tenantId, isActive: true },
                            orderBy: { isPrimary: 'desc' },
                            select: { phoneNumber: true },
                        });
                    }
                    if (!phoneNumberRecord) {
                        phoneNumberRecord = await this.prisma.twilioPhoneNumber.findFirst({
                            where: { isActive: true },
                            orderBy: { isPrimary: 'desc' },
                            select: { phoneNumber: true },
                        });
                    }
                    if (phoneNumberRecord) {
                        callerId = phoneNumberRecord.phoneNumber;
                        this.logger.log(`Using fallback CallerId: ${callerId}`);
                    }
                }
                catch (err) {
                    this.logger.error(`Failed to fetch fallback phone number: ${err.message}`);
                }
            }
            if (!callerId || !callerId.startsWith('+')) {
                this.logger.error('Outgoing call failed: No valid caller ID available');
                response.say({ voice: 'alice' }, 'Unable to make outgoing calls. No valid caller ID configured.');
                response.hangup();
            }
            else {
                this.logger.log(`Making outbound call from ${callerId} to ${to}`);
                if (tenantId && callSid) {
                    try {
                        let callerTenantUserId = undefined;
                        if (userId) {
                            const tenantUser = await this.prisma.tenantUser.findFirst({
                                where: {
                                    tenantId,
                                    userId,
                                },
                            });
                            callerTenantUserId = tenantUser?.id;
                            this.logger.log(`Found TenantUser: ${callerTenantUserId || 'none'} for userId ${userId}`);
                        }
                        await this.phoneCallService.createCall({
                            tenantId,
                            twilioCallSid: callSid,
                            direction: 'outbound',
                            fromNumber: callerId,
                            toNumber: to,
                            status: 'initiated',
                            callerId: callerTenantUserId,
                        });
                        this.logger.log(`Created outbound call record for ${callSid}`);
                    }
                    catch (err) {
                        this.logger.error(`Failed to create outbound call record: ${err.message}`);
                    }
                }
                const baseUrl = process.env.API_BASE_URL || 'https://api.htownautos.com';
                const dialActionCallback = `${baseUrl}/api/v1/twilio/client/outgoing-status?tenantId=${encodeURIComponent(tenantId)}`;
                const numberStatusCallback = `${baseUrl}/api/v1/twilio/client/outgoing-number-status?tenantId=${encodeURIComponent(tenantId)}&parentCallSid=${encodeURIComponent(callSid)}`;
                const recordingCallback = `${baseUrl}/api/v1/twilio/voice/recording/${tenantId}/${callSid}`;
                const dial = response.dial({
                    callerId,
                    action: dialActionCallback,
                    method: 'POST',
                    record: 'record-from-answer-dual',
                    recordingStatusCallback: recordingCallback,
                    recordingStatusCallbackMethod: 'POST',
                    recordingStatusCallbackEvent: ['completed'],
                });
                dial.number({
                    statusCallback: numberStatusCallback,
                    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
                    statusCallbackMethod: 'POST',
                }, to);
                this.logger.log(`Outbound call configured with recording callback: ${recordingCallback}`);
            }
        }
        res.type('text/xml');
        res.send(response.toString());
    }
    async handleOutgoingStatus(body, tenantId, res) {
        this.logger.log(`=== OUTGOING CALL STATUS CALLBACK ===`);
        this.logger.log(`TenantId from query: ${tenantId}`);
        this.logger.log(`Full body: ${JSON.stringify(body, null, 2)}`);
        const callSid = body.CallSid;
        const dialCallStatus = body.DialCallStatus;
        const dialCallDuration = body.DialCallDuration;
        this.logger.log(`Outgoing call status - CallSid: ${callSid}, TenantId: ${tenantId}, Status: ${dialCallStatus}, Duration: ${dialCallDuration}`);
        try {
            let status = 'completed';
            if (dialCallStatus === 'no-answer') {
                status = 'no-answer';
            }
            else if (dialCallStatus === 'busy') {
                status = 'busy';
            }
            else if (dialCallStatus === 'failed') {
                status = 'failed';
            }
            else if (dialCallStatus === 'canceled') {
                status = 'canceled';
            }
            await this.phoneCallService.updateCallByTwilioSid(callSid, {
                status,
                duration: dialCallDuration ? parseInt(dialCallDuration, 10) : undefined,
                endedAt: new Date(),
                answeredAt: dialCallStatus === 'completed' ? new Date() : undefined,
            });
            this.logger.log(`Updated outbound call ${callSid} with status ${status}`);
        }
        catch (err) {
            this.logger.error(`Failed to update outbound call status: ${err.message}`);
        }
        const response = new VoiceResponse();
        res.type('text/xml');
        res.send(response.toString());
    }
    async handleOutgoingNumberStatus(body, tenantId, parentCallSid) {
        const callStatus = body.CallStatus;
        const childCallSid = body.CallSid;
        this.logger.log(`Outgoing number status - ParentCallSid: ${parentCallSid}, ChildCallSid: ${childCallSid}, Status: ${callStatus}`);
        if (!parentCallSid || !callStatus) {
            return { success: true };
        }
        try {
            const statusMap = {
                'initiated': 'initiated',
                'ringing': 'ringing',
                'answered': 'in-progress',
                'in-progress': 'in-progress',
                'completed': 'completed',
                'busy': 'busy',
                'no-answer': 'no-answer',
                'failed': 'failed',
                'canceled': 'canceled',
            };
            const mappedStatus = statusMap[callStatus] || callStatus;
            const updateData = { status: mappedStatus };
            if (callStatus === 'answered' || callStatus === 'in-progress') {
                updateData.answeredAt = new Date();
            }
            await this.phoneCallService.updateCallByTwilioSid(parentCallSid, updateData);
            this.logger.log(`Updated outbound call ${parentCallSid} to ${mappedStatus} (from child ${childCallSid})`);
        }
        catch (err) {
            this.logger.error(`Failed to update outbound call number status: ${err.message}`);
        }
        return { success: true };
    }
    async handleIncomingClientCall(body, res) {
        const identity = body.identity || '';
        this.logger.log(`Routing call to client: ${identity}`);
        const response = new VoiceResponse();
        const dial = response.dial();
        dial.client(identity);
        res.type('text/xml');
        res.send(response.toString());
    }
    async setupTwimlApp() {
        const appSid = await this.twilioService.getOrCreateTwimlApp();
        return {
            twimlAppSid: appSid,
            message: 'Add this SID to your .env file as TWILIO_TWIML_APP_SID',
        };
    }
};
exports.TwilioClientController = TwilioClientController;
__decorate([
    (0, common_1.Get)('token'),
    (0, common_1.UseGuards)(auth_2.ClerkJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get Twilio Voice token for browser calling' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token generated successfully' }),
    __param(0, (0, auth_3.CurrentUser)()),
    __param(1, (0, auth_4.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TwilioClientController.prototype, "getVoiceToken", null);
__decorate([
    (0, common_1.Post)('outgoing'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TwilioClientController.prototype, "handleOutgoingCall", null);
__decorate([
    (0, common_1.Post)('outgoing-status'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TwilioClientController.prototype, "handleOutgoingStatus", null);
__decorate([
    (0, common_1.Post)('outgoing-number-status'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('parentCallSid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TwilioClientController.prototype, "handleOutgoingNumberStatus", null);
__decorate([
    (0, common_1.Post)('incoming/:identity'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TwilioClientController.prototype, "handleIncomingClientCall", null);
__decorate([
    (0, common_1.Get)('setup-twiml-app'),
    (0, common_1.UseGuards)(auth_2.ClerkJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create or get TwiML App SID for voice client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'TwiML App SID' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TwilioClientController.prototype, "setupTwimlApp", null);
exports.TwilioClientController = TwilioClientController = TwilioClientController_1 = __decorate([
    (0, swagger_1.ApiTags)('Twilio Client'),
    (0, common_1.Controller)('twilio/client'),
    __metadata("design:paramtypes", [twilio_service_1.TwilioService,
        prisma_1.PrismaService,
        phone_call_service_1.PhoneCallService])
], TwilioClientController);
//# sourceMappingURL=twilio-client.controller.js.map