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
var TwilioWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const express = __importStar(require("express"));
const auth_1 = require("@htownautos/auth");
const call_flow_service_1 = require("../call-flow/call-flow.service");
const twiml_generator_service_1 = require("../call-flow/twiml-generator.service");
const call_flow_dto_1 = require("../call-flow/dto/call-flow.dto");
const phone_call_service_1 = require("../phone-call/phone-call.service");
const sms_service_1 = require("../sms/sms.service");
let TwilioWebhookController = TwilioWebhookController_1 = class TwilioWebhookController {
    callFlowService;
    twimlGenerator;
    phoneCallService;
    smsService;
    logger = new common_1.Logger(TwilioWebhookController_1.name);
    constructor(callFlowService, twimlGenerator, phoneCallService, smsService) {
        this.callFlowService = callFlowService;
        this.twimlGenerator = twimlGenerator;
        this.phoneCallService = phoneCallService;
        this.smsService = smsService;
    }
    buildCallContext(tenantId, phoneNumberId, payload, callFlowId, recordCalls = false) {
        return {
            tenantId,
            phoneNumberId,
            callSid: payload.CallSid,
            from: payload.From,
            to: payload.To,
            callFlowId,
            variables: {},
            tags: [],
            recordCalls,
        };
    }
    async handleIncomingVoice(tenantId, phoneId, payload, twilioSignature, res) {
        this.logger.log(`Incoming voice call for tenant ${tenantId}, phone ${phoneId}`);
        this.logger.debug(`Call from ${payload.From} to ${payload.To}, CallSid: ${payload.CallSid}`);
        try {
            await this.phoneCallService.createCall({
                tenantId,
                twilioCallSid: payload.CallSid,
                direction: 'inbound',
                fromNumber: payload.From,
                toNumber: payload.To,
                status: 'ringing',
            });
        }
        catch (err) {
            this.logger.error(`Failed to create call record: ${err.message}`);
        }
        try {
            const result = await this.callFlowService.getCallFlowForPhoneNumber(phoneId);
            if (!result) {
                this.logger.warn(`Phone number ${phoneId} not found`);
                res.type('text/xml');
                res.send(this.twimlGenerator.generateDefaultTwiml(tenantId));
                return;
            }
            const { callFlow, phoneNumber } = result;
            if (!callFlow || !callFlow.isActive) {
                this.logger.debug(`No active call flow for phone ${phoneId}`);
                res.type('text/xml');
                res.send(this.twimlGenerator.generateDefaultTwiml(tenantId));
                return;
            }
            const context = this.buildCallContext(tenantId, phoneId, payload, callFlow.id, callFlow.recordInboundCalls);
            const twiml = await this.twimlGenerator.startCallFlow(callFlow.steps, context);
            this.logger.debug(`Generated TwiML for call flow ${callFlow.id}`);
            res.type('text/xml');
            res.send(twiml);
        }
        catch (error) {
            this.logger.error(`Error handling incoming call: ${error.message}`, error.stack);
            res.type('text/xml');
            res.send(this.twimlGenerator.generateDefaultTwiml(tenantId));
        }
    }
    async handleFlowContinuation(tenantId, phoneId, stepIndex, action, queryParams, payload, res) {
        this.logger.debug(`Flow continuation for tenant ${tenantId}, phone ${phoneId}, step ${stepIndex}, action ${action}`);
        try {
            const result = await this.callFlowService.getCallFlowForPhoneNumber(phoneId);
            if (!result?.callFlow) {
                res.type('text/xml');
                res.send(this.twimlGenerator.generateDefaultTwiml(tenantId));
                return;
            }
            const { callFlow } = result;
            const context = this.buildCallContext(tenantId, phoneId, payload, callFlow.id, callFlow.recordInboundCalls);
            const currentStep = parseInt(stepIndex, 10);
            let twiml;
            switch (action) {
                case 'menu': {
                    const digit = payload.Digits;
                    if (digit) {
                        twiml = await this.twimlGenerator.handleMenuSelection(callFlow.steps, currentStep, digit, context);
                    }
                    else {
                        const step = callFlow.steps[currentStep];
                        if (step?.type === call_flow_dto_1.CallFlowStepType.MENU) {
                            const config = step.config;
                            if (config.invalidInputSteps?.length) {
                                twiml = await this.twimlGenerator.executeNestedSteps(config.invalidInputSteps, 0, context);
                            }
                            else {
                                twiml = this.twimlGenerator.generateHangupTwiml();
                            }
                        }
                        else {
                            twiml = this.twimlGenerator.generateHangupTwiml();
                        }
                    }
                    break;
                }
                case 'menu_retry': {
                    const retryCount = parseInt(queryParams.retry || '0', 10);
                    twiml = await this.twimlGenerator.executeStep(callFlow.steps, currentStep, context, { retry: retryCount.toString() });
                    break;
                }
                case 'menu_invalid': {
                    const step = callFlow.steps[currentStep];
                    if (step?.type === call_flow_dto_1.CallFlowStepType.MENU) {
                        const config = step.config;
                        if (config.invalidInputSteps?.length) {
                            twiml = await this.twimlGenerator.executeNestedSteps(config.invalidInputSteps, 0, context);
                        }
                        else {
                            twiml = this.twimlGenerator.generateHangupTwiml();
                        }
                    }
                    else {
                        twiml = this.twimlGenerator.generateHangupTwiml();
                    }
                    break;
                }
                case 'round_robin': {
                    const attempt = parseInt(queryParams.attempt || '1', 10);
                    const attemptIndex = attempt - 1;
                    const callWasInProgress = await this.phoneCallService.wasCallAnswered(payload.CallSid);
                    this.logger.log(`Round robin dial.action callback: attemptIndex=${attemptIndex}, callWasInProgress=${callWasInProgress}`);
                    if (callWasInProgress) {
                        try {
                            await this.associateRoundRobinUser(tenantId, payload.CallSid, callFlow.steps, currentStep, attemptIndex);
                        }
                        catch (err) {
                            this.logger.error(`Failed to associate round-robin user: ${err.message}`);
                        }
                        const twilio = require('twilio');
                        const response = new twilio.twiml.VoiceResponse();
                        response.hangup();
                        twiml = response.toString();
                    }
                    else {
                        this.logger.log(`Round robin dial.action: agent did not answer, agent-status callback should have handled redirect`);
                        const twilio = require('twilio');
                        const response = new twilio.twiml.VoiceResponse();
                        response.hangup();
                        twiml = response.toString();
                    }
                    break;
                }
                case 'round_robin_redirect': {
                    const attemptIndex = parseInt(queryParams.attempt || '0', 10);
                    this.logger.log(`Round robin redirect: trying agent at index ${attemptIndex}`);
                    twiml = await this.twimlGenerator.executeStep(callFlow.steps, currentStep, context, { attempt: attemptIndex.toString() });
                    break;
                }
                case 'keypad': {
                    const digit = payload.Digits;
                    if (digit) {
                        const varName = queryParams.var || 'keypad_input';
                        context.variables[varName] = digit;
                        this.logger.debug(`Stored keypad input: ${varName}=${digit}`);
                    }
                    twiml = await this.twimlGenerator.executeStep(callFlow.steps, currentStep + 1, context);
                    break;
                }
                default: {
                    twiml = await this.twimlGenerator.executeStep(callFlow.steps, currentStep, context, queryParams);
                }
            }
            res.type('text/xml');
            res.send(twiml);
        }
        catch (error) {
            this.logger.error(`Error handling flow continuation: ${error.message}`, error.stack);
            res.type('text/xml');
            res.send(this.twimlGenerator.generateDefaultTwiml(tenantId));
        }
    }
    async handleDialStatus(tenantId, phoneId, stepIndex, payload, res) {
        this.logger.debug(`Dial status for tenant ${tenantId}, phone ${phoneId}: ${payload.DialCallStatus}`);
        try {
            const result = await this.callFlowService.getCallFlowForPhoneNumber(phoneId);
            if (!result?.callFlow) {
                res.type('text/xml');
                res.send(this.twimlGenerator.generateDefaultTwiml(tenantId));
                return;
            }
            const { callFlow } = result;
            const context = this.buildCallContext(tenantId, phoneId, payload, callFlow.id, callFlow.recordInboundCalls);
            const currentStep = parseInt(stepIndex, 10);
            const callWasAnswered = await this.phoneCallService.wasCallAnswered(payload.CallSid);
            this.logger.log(`Dial status callback: DialCallStatus=${payload.DialCallStatus}, callWasAnswered=${callWasAnswered}`);
            if (callWasAnswered) {
                try {
                    await this.associateAnsweringUser(tenantId, payload.CallSid, callFlow.steps, currentStep);
                }
                catch (err) {
                    this.logger.error(`Failed to associate answering user: ${err.message}`);
                }
            }
            const effectiveStatus = callWasAnswered ? 'completed' : 'no-answer';
            const twiml = await this.twimlGenerator.handleDialStatus(callFlow.steps, currentStep, effectiveStatus, context);
            res.type('text/xml');
            res.send(twiml);
        }
        catch (error) {
            this.logger.error(`Error handling dial status: ${error.message}`, error.stack);
            res.type('text/xml');
            res.send(this.twimlGenerator.generateDefaultTwiml(tenantId));
        }
    }
    async handleNestedDialStatus(tenantId, phoneId, rrAttempt, payload, res) {
        this.logger.debug(`Nested dial status for tenant ${tenantId}, phone ${phoneId}: ${payload.DialCallStatus}`);
        try {
            const result = await this.callFlowService.getCallFlowForPhoneNumber(phoneId);
            if (!result?.callFlow) {
                res.type('text/xml');
                res.send(this.twimlGenerator.generateDefaultTwiml(tenantId));
                return;
            }
            const { callFlow } = result;
            const context = this.buildCallContext(tenantId, phoneId, payload, callFlow.id, callFlow.recordInboundCalls);
            const callWasAnswered = await this.phoneCallService.wasCallAnswered(payload.CallSid);
            this.logger.log(`Nested dial status: DialCallStatus=${payload.DialCallStatus}, callWasAnswered=${callWasAnswered}, rrAttempt=${rrAttempt}`);
            if (callWasAnswered) {
                try {
                    await this.associateNestedDialUser(tenantId, payload.CallSid);
                }
                catch (err) {
                    this.logger.error(`Failed to associate nested dial user: ${err.message}`);
                }
            }
            const twiml = await this.twimlGenerator.handleNestedDialStatus(payload.CallSid, context, callWasAnswered, rrAttempt ? parseInt(rrAttempt, 10) : undefined);
            res.type('text/xml');
            res.send(twiml);
        }
        catch (error) {
            this.logger.error(`Error handling nested dial status: ${error.message}`, error.stack);
            res.type('text/xml');
            res.send(this.twimlGenerator.generateDefaultTwiml(tenantId));
        }
    }
    async associateNestedDialUser(tenantId, callSid) {
        const call = await this.phoneCallService.getCallByTwilioSid(callSid);
        if (!call)
            return;
        const metaValue = call.metaValue || {};
        const conferenceTarget = metaValue.conferenceTarget;
        if (conferenceTarget && this.isUUID(conferenceTarget)) {
            const tenantUser = await this.callFlowService.findTenantUserByUserId(tenantId, conferenceTarget);
            if (tenantUser) {
                await this.phoneCallService.associateUserWithCall(callSid, tenantUser.id);
                this.logger.log(`Associated nested dial user ${conferenceTarget} with call ${callSid}`);
            }
        }
    }
    async associateAnsweringUser(tenantId, callSid, steps, stepIndex) {
        const step = steps[stepIndex];
        if (!step)
            return;
        let userId = null;
        if (step.type === 'dial') {
            const config = step.config;
            if (config.destination && this.isUUID(config.destination)) {
                userId = config.destination;
            }
        }
        else if (step.type === 'simulcall') {
            const config = step.config;
            if (config.destinations?.length === 1 && this.isUUID(config.destinations[0])) {
                userId = config.destinations[0];
            }
        }
        if (userId) {
            const tenantUser = await this.callFlowService.findTenantUserByUserId(tenantId, userId);
            if (tenantUser) {
                await this.phoneCallService.associateUserWithCall(callSid, tenantUser.id);
                this.logger.log(`Associated user ${userId} (TenantUser: ${tenantUser.id}) with call ${callSid}`);
            }
        }
    }
    isUUID(str) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    }
    async associateRoundRobinUser(tenantId, callSid, steps, stepIndex, attemptIndex) {
        const step = steps[stepIndex];
        if (!step || step.type !== 'round_robin')
            return;
        const config = step.config;
        if (!config.destinations || attemptIndex >= config.destinations.length)
            return;
        const destination = config.destinations[attemptIndex];
        if (this.isUUID(destination)) {
            const tenantUser = await this.callFlowService.findTenantUserByUserId(tenantId, destination);
            if (tenantUser) {
                await this.phoneCallService.associateUserWithCall(callSid, tenantUser.id);
                this.logger.log(`Associated round-robin user ${destination} (TenantUser: ${tenantUser.id}) with call ${callSid}`);
            }
        }
    }
    async handleVoiceStatus(tenantId, phoneId, payload, twilioSignature) {
        this.logger.log(`Voice status update for tenant ${tenantId}, phone ${phoneId}`);
        this.logger.debug(`CallSid: ${payload.CallSid}, Status: ${payload.CallStatus}, Duration: ${payload.CallDuration}`);
        if (!payload.CallSid || !payload.CallStatus) {
            return { success: true };
        }
        try {
            const statusMap = {
                'initiated': 'initiated',
                'ringing': 'ringing',
                'in-progress': 'in-progress',
                'completed': 'completed',
                'busy': 'busy',
                'no-answer': 'no-answer',
                'failed': 'failed',
                'canceled': 'canceled',
            };
            const callStatus = payload.CallStatus;
            const mappedStatus = statusMap[callStatus] || callStatus;
            const originalCall = await this.phoneCallService.getCallByTwilioSid(payload.CallSid);
            if (['completed', 'busy', 'no-answer', 'failed', 'canceled'].includes(callStatus)) {
                const activeSegment = await this.phoneCallService.getLatestCallSegment(payload.CallSid);
                if (activeSegment && activeSegment.status !== 'transferred' && activeSegment.twilioCallSid) {
                    await this.phoneCallService.updateCallByTwilioSid(activeSegment.twilioCallSid, {
                        status: mappedStatus,
                        endedAt: new Date(),
                        duration: payload.CallDuration ? parseInt(payload.CallDuration, 10) : undefined,
                    });
                    this.logger.log(`Call completed: Updated segment ${activeSegment.twilioCallSid} to ${mappedStatus}`);
                }
                else {
                    this.logger.log(`Call completed: No active segment found for ${payload.CallSid}, all segments transferred`);
                }
            }
            else {
                if (originalCall && originalCall.status !== 'transferred') {
                    const updateData = { status: mappedStatus };
                    if (callStatus === 'in-progress') {
                        updateData.answeredAt = new Date();
                    }
                    await this.phoneCallService.updateCallByTwilioSid(payload.CallSid, updateData);
                    this.logger.log(`Updated call ${payload.CallSid} to ${mappedStatus}`);
                }
            }
        }
        catch (err) {
            this.logger.error(`Failed to update call status: ${err.message}`);
        }
        return { success: true };
    }
    async handleVoicemailRecording(tenantId, callSid, payload, res) {
        this.logger.log(`Voicemail received for tenant ${tenantId}, call ${callSid}`);
        this.logger.debug(`Recording URL: ${payload.RecordingUrl}, Duration: ${payload.RecordingDuration}`);
        try {
            await this.phoneCallService.updateCallByTwilioSid(callSid, {
                outcome: 'voicemail',
                status: 'completed',
                endedAt: new Date(),
            });
            if (payload.RecordingUrl && payload.RecordingSid) {
                await this.phoneCallService.processRecording(callSid, payload.RecordingSid, payload.RecordingUrl, parseInt(payload.RecordingDuration || '0', 10));
                this.logger.log(`Voicemail recording processed for call ${callSid}`);
            }
        }
        catch (err) {
            this.logger.error(`Failed to process voicemail: ${err.message}`);
        }
        const twilio = require('twilio');
        const response = new twilio.twiml.VoiceResponse();
        response.say({ voice: 'alice' }, 'Thank you for your message. Goodbye.');
        response.hangup();
        res.type('text/xml');
        res.send(response.toString());
    }
    async handleTranscription(tenantId, callSid, payload) {
        this.logger.log(`Transcription received for tenant ${tenantId}, call ${callSid}`);
        this.logger.debug(`Transcription: ${payload.TranscriptionText?.substring(0, 100)}...`);
        if (payload.TranscriptionText) {
            try {
                await this.phoneCallService.updateTranscription(callSid, JSON.stringify({ text: payload.TranscriptionText, source: 'twilio' }), 'completed');
                this.logger.log(`Voicemail transcription stored for call ${callSid}`);
            }
            catch (err) {
                this.logger.error(`Failed to store voicemail transcription: ${err.message}`);
            }
        }
        return { success: true };
    }
    getRingTwiml() {
        const VoiceResponse = require('twilio').twiml.VoiceResponse;
        const response = new VoiceResponse();
        response.say({ voice: 'Polly.Joanna', language: 'en-US' }, 'Please wait while we connect your call.');
        for (let i = 0; i < 5; i++) {
            response.pause({ length: 10 });
            response.say({ voice: 'Polly.Joanna', language: 'en-US' }, 'Please continue to hold.');
        }
        response.pause({ length: 30 });
        return response.toString();
    }
    async handleRecordingStatus(tenantId, callSid, payload) {
        this.logger.log(`Recording status for tenant ${tenantId}, call ${callSid}`);
        this.logger.debug(`Recording SID: ${payload.RecordingSid}, Status: ${payload.RecordingStatus}, URL: ${payload.RecordingUrl}`);
        if (payload.RecordingStatus === 'completed' && payload.RecordingUrl && payload.RecordingSid) {
            try {
                await this.phoneCallService.processRecording(callSid, payload.RecordingSid, payload.RecordingUrl, parseInt(payload.RecordingDuration || '0', 10));
                this.logger.log(`Recording processed for call ${callSid}`);
            }
            catch (err) {
                this.logger.error(`Failed to process recording: ${err.message}`);
            }
        }
        return { success: true };
    }
    async handleSegmentRecordingStatus(tenantId, callSid, segmentNumber, payload) {
        const segment = parseInt(segmentNumber, 10);
        this.logger.log(`Recording status for tenant ${tenantId}, call ${callSid}, segment ${segment}`);
        this.logger.debug(`Recording SID: ${payload.RecordingSid}, Status: ${payload.RecordingStatus}, URL: ${payload.RecordingUrl}`);
        if (payload.RecordingStatus === 'completed' && payload.RecordingUrl && payload.RecordingSid) {
            try {
                await this.phoneCallService.processSegmentRecording(callSid, segment, payload.RecordingSid, payload.RecordingUrl, parseInt(payload.RecordingDuration || '0', 10));
                this.logger.log(`Recording processed for call ${callSid} segment ${segment}`);
            }
            catch (err) {
                this.logger.error(`Failed to process segment recording: ${err.message}`);
            }
        }
        return { success: true };
    }
    async handleConferenceStatus(tenantId, callSid, segmentNumber, attempt, payload) {
        const segment = parseInt(segmentNumber, 10);
        const attemptIndex = attempt ? parseInt(attempt, 10) : 0;
        this.logger.log(`Conference event for tenant ${tenantId}, call ${callSid}, segment ${segment}`);
        this.logger.debug(`Conference: ${payload.ConferenceSid}, Event: ${payload.StatusCallbackEvent}, FriendlyName: ${payload.FriendlyName}`);
        const conferenceSid = payload.ConferenceSid;
        const eventType = payload.StatusCallbackEvent;
        const conferenceName = payload.FriendlyName;
        try {
            switch (eventType) {
                case 'conference-start':
                    this.logger.log(`Conference started: ${conferenceName}`);
                    break;
                case 'participant-join':
                    this.logger.log(`Participant joined conference ${conferenceName}: ${payload.CallSid}`);
                    if (payload.CallSid === callSid) {
                        this.logger.log(`Caller joined conference, dialing agent(s) into ${conferenceName}`);
                        await this.phoneCallService.updateConferenceInfo(callSid, segment, conferenceSid, conferenceName);
                        await this.phoneCallService.dialAgentIntoConference(callSid, segment, conferenceName, tenantId);
                    }
                    else {
                        await this.phoneCallService.handleAgentJoinedConference(callSid, segment, payload.CallSid);
                    }
                    break;
                case 'participant-leave':
                    this.logger.log(`Participant left conference ${conferenceName}: ${payload.CallSid}`);
                    if (payload.CallSid === callSid) {
                        this.logger.log(`Caller left conference, terminating pending agent calls`);
                        await this.phoneCallService.terminatePendingAgentCalls(callSid, segment);
                    }
                    else {
                        const callRecord = await this.phoneCallService.getCallByOriginalSidAndSegment(callSid, segment);
                        if (callRecord?.status === 'transferred') {
                            this.logger.log(`Agent left conference but call was transferred - not terminating caller`);
                        }
                        else {
                            this.logger.log(`Agent left conference, terminating caller's call`);
                            await this.phoneCallService.terminateCallerCall(callSid);
                        }
                    }
                    break;
                case 'conference-end':
                    this.logger.log(`Conference ended: ${conferenceName}`);
                    await this.phoneCallService.terminatePendingAgentCalls(callSid, segment);
                    break;
            }
        }
        catch (err) {
            this.logger.error(`Failed to handle conference event: ${err.message}`);
        }
        return { success: true };
    }
    async handleAgentCallStatus(tenantId, callSid, segmentNumber, phoneId, step, attempt, payload) {
        const segment = parseInt(segmentNumber, 10);
        const agentCallSid = payload.CallSid;
        const callStatus = payload.CallStatus;
        this.logger.log(`Agent call status for tenant ${tenantId}, caller ${callSid}, segment ${segment}`);
        this.logger.debug(`Agent CallSid: ${agentCallSid}, Status: ${callStatus}`);
        if (callStatus === 'completed' || callStatus === 'busy' || callStatus === 'no-answer' || callStatus === 'failed' || callStatus === 'canceled') {
            try {
                const wasAnswered = await this.phoneCallService.handleAgentCallStatus(callSid, segment, agentCallSid, callStatus);
                if (!wasAnswered && callStatus !== 'completed') {
                    const attemptFailed = await this.phoneCallService.didConferenceAttemptFail(callSid, segment);
                    if (attemptFailed) {
                        if (phoneId && step) {
                            const currentAttempt = parseInt(attempt || '0', 10);
                            const nextAttempt = currentAttempt + 1;
                            this.logger.log(`All agents failed for ${callSid}, checking step type to determine next action`);
                            const result = await this.callFlowService.getCallFlowForPhoneNumber(phoneId);
                            if (result?.callFlow) {
                                const stepIndex = parseInt(step, 10);
                                const stepConfig = result.callFlow.steps[stepIndex];
                                const baseUrl = process.env.API_BASE_URL || 'https://api.htownautos.com';
                                const twilio = require('twilio');
                                const response = new twilio.twiml.VoiceResponse();
                                if (stepConfig?.type === 'round_robin' && stepConfig.config) {
                                    const destinations = stepConfig.config.destinations || [];
                                    if (nextAttempt < destinations.length) {
                                        const redirectUrl = `${baseUrl}/api/v1/twilio/voice/flow/${tenantId}/${phoneId}?step=${step}&action=round_robin_redirect&attempt=${nextAttempt}`;
                                        response.redirect({ method: 'POST' }, redirectUrl);
                                        await this.phoneCallService.redirectCallerCall(callSid, response.toString());
                                        this.logger.log(`Redirected caller ${callSid} to round robin agent at index ${nextAttempt}`);
                                    }
                                    else {
                                        const nextStepIndex = stepIndex + 1;
                                        this.logger.log(`No more round robin destinations for ${callSid}, continuing to step ${nextStepIndex}`);
                                        const redirectUrl = `${baseUrl}/api/v1/twilio/voice/flow/${tenantId}/${phoneId}?step=${nextStepIndex}`;
                                        response.redirect({ method: 'POST' }, redirectUrl);
                                        await this.phoneCallService.redirectCallerCall(callSid, response.toString());
                                        this.logger.log(`Redirected caller ${callSid} to next call flow step ${nextStepIndex}`);
                                    }
                                }
                                else if (stepConfig?.type === 'dial' || stepConfig?.type === 'simulcall') {
                                    const nextStepIndex = stepIndex + 1;
                                    this.logger.log(`${stepConfig.type} failed for ${callSid}, continuing to step ${nextStepIndex}`);
                                    const redirectUrl = `${baseUrl}/api/v1/twilio/voice/flow/${tenantId}/${phoneId}?step=${nextStepIndex}`;
                                    response.redirect({ method: 'POST' }, redirectUrl);
                                    await this.phoneCallService.redirectCallerCall(callSid, response.toString());
                                    this.logger.log(`Redirected caller ${callSid} to next call flow step ${nextStepIndex}`);
                                }
                            }
                        }
                        else {
                            const callRecord = await this.phoneCallService.getCallByTwilioSid(callSid);
                            const metaValue = callRecord?.metaValue || {};
                            if (metaValue.isNestedFlow) {
                                this.logger.log(`Nested flow agent didn't answer for ${callSid}, checking for remaining steps`);
                                const nestedPhoneId = metaValue.phoneNumberId;
                                if (nestedPhoneId) {
                                    const result = await this.callFlowService.getCallFlowForPhoneNumber(nestedPhoneId);
                                    if (result?.callFlow) {
                                        const context = this.buildCallContext(tenantId, nestedPhoneId, { CallSid: callSid, From: callRecord?.fromNumber || '', To: callRecord?.toNumber || '' }, result.callFlow.id, result.callFlow.recordInboundCalls);
                                        const twiml = await this.twimlGenerator.handleNestedDialStatus(callSid, context, false, metaValue.nestedRoundRobin?.currentAttempt);
                                        await this.phoneCallService.redirectCallerCall(callSid, twiml);
                                        this.logger.log(`Redirected caller ${callSid} to nested flow fallback`);
                                    }
                                    else {
                                        this.logger.log(`No call flow found for nested flow ${callSid}, terminating`);
                                        await this.phoneCallService.terminateCallerCall(callSid);
                                    }
                                }
                                else {
                                    this.logger.log(`No phoneNumberId for nested flow ${callSid}, terminating`);
                                    await this.phoneCallService.terminateCallerCall(callSid);
                                }
                            }
                            else if (segment > 0) {
                                this.logger.log(`Transfer target didn't answer for ${callSid} segment ${segment}, terminating caller's call`);
                                await this.phoneCallService.terminateCallerCall(callSid);
                                const transferCallRecord = await this.phoneCallService.getCallByOriginalSidAndSegment(callSid, segment);
                                if (transferCallRecord) {
                                    await this.phoneCallService.updateCallByTwilioSid(transferCallRecord.twilioCallSid, { status: 'failed' });
                                }
                            }
                        }
                        await this.phoneCallService.clearConferenceAttemptFailed(callSid, segment);
                    }
                }
            }
            catch (err) {
                this.logger.error(`Failed to handle agent call status: ${err.message}`);
            }
        }
        return { success: true };
    }
    async handleIncomingSms(tenantId, phoneId, payload, twilioSignature, res) {
        this.logger.log(`Incoming SMS for tenant ${tenantId}, phone ${phoneId}`);
        this.logger.debug(`SMS from ${payload.From} to ${payload.To}: ${payload.Body?.substring(0, 50)}...`);
        try {
            await this.smsService.handleIncomingSms(tenantId, phoneId, {
                MessageSid: payload.MessageSid,
                From: payload.From,
                To: payload.To,
                Body: payload.Body,
                NumMedia: payload.NumMedia,
                NumSegments: payload.NumSegments,
            });
        }
        catch (error) {
            this.logger.error(`Failed to handle incoming SMS: ${error.message}`);
        }
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;
        res.type('text/xml');
        res.send(twiml);
    }
    async handleSmsStatus(tenantId, phoneId, payload, twilioSignature) {
        this.logger.log(`SMS status update for tenant ${tenantId}, phone ${phoneId}`);
        this.logger.debug(`MessageSid: ${payload.MessageSid}, Status: ${payload.MessageStatus}`);
        try {
            if (payload.MessageSid && payload.MessageStatus) {
                await this.smsService.handleSmsStatusUpdate(tenantId, {
                    MessageSid: payload.MessageSid,
                    MessageStatus: payload.MessageStatus,
                    ErrorCode: payload.ErrorCode,
                    ErrorMessage: payload.ErrorMessage,
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle SMS status update: ${error.message}`);
        }
        return { success: true };
    }
};
exports.TwilioWebhookController = TwilioWebhookController;
__decorate([
    (0, common_1.Post)('voice/incoming/:tenantId/:phoneId'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('phoneId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-twilio-signature')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleIncomingVoice", null);
__decorate([
    (0, common_1.Post)('voice/flow/:tenantId/:phoneId'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('phoneId')),
    __param(2, (0, common_1.Query)('step')),
    __param(3, (0, common_1.Query)('action')),
    __param(4, (0, common_1.Query)()),
    __param(5, (0, common_1.Body)()),
    __param(6, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleFlowContinuation", null);
__decorate([
    (0, common_1.Post)('voice/flow/:tenantId/:phoneId/dial-status'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('phoneId')),
    __param(2, (0, common_1.Query)('step')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleDialStatus", null);
__decorate([
    (0, common_1.Post)('voice/flow/:tenantId/:phoneId/nested-dial-status'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('phoneId')),
    __param(2, (0, common_1.Query)('rrAttempt')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleNestedDialStatus", null);
__decorate([
    (0, common_1.Post)('voice/incoming/:tenantId/:phoneId/status'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('phoneId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-twilio-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleVoiceStatus", null);
__decorate([
    (0, common_1.Post)('voice/voicemail/:tenantId/:callSid'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('callSid')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleVoicemailRecording", null);
__decorate([
    (0, common_1.Post)('voice/transcription/:tenantId/:callSid'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('callSid')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleTranscription", null);
__decorate([
    (0, common_1.Get)('voice/ring'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Header)('Content-Type', 'text/xml'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TwilioWebhookController.prototype, "getRingTwiml", null);
__decorate([
    (0, common_1.Post)('voice/recording/:tenantId/:callSid'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('callSid')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleRecordingStatus", null);
__decorate([
    (0, common_1.Post)('voice/recording/:tenantId/:callSid/:segmentNumber'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('callSid')),
    __param(2, (0, common_1.Param)('segmentNumber')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleSegmentRecordingStatus", null);
__decorate([
    (0, common_1.Post)('voice/conference/:tenantId/:callSid/:segmentNumber'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('callSid')),
    __param(2, (0, common_1.Param)('segmentNumber')),
    __param(3, (0, common_1.Query)('attempt')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleConferenceStatus", null);
__decorate([
    (0, common_1.Post)('voice/agent-status/:tenantId/:callSid/:segmentNumber'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('callSid')),
    __param(2, (0, common_1.Param)('segmentNumber')),
    __param(3, (0, common_1.Query)('phoneId')),
    __param(4, (0, common_1.Query)('step')),
    __param(5, (0, common_1.Query)('attempt')),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleAgentCallStatus", null);
__decorate([
    (0, common_1.Post)('sms/incoming/:tenantId/:phoneId'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('phoneId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-twilio-signature')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleIncomingSms", null);
__decorate([
    (0, common_1.Post)('sms/incoming/:tenantId/:phoneId/status'),
    (0, auth_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('phoneId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-twilio-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], TwilioWebhookController.prototype, "handleSmsStatus", null);
exports.TwilioWebhookController = TwilioWebhookController = TwilioWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Twilio Webhooks'),
    (0, common_1.Controller)('twilio'),
    __metadata("design:paramtypes", [call_flow_service_1.CallFlowService,
        twiml_generator_service_1.TwimlGeneratorService,
        phone_call_service_1.PhoneCallService,
        sms_service_1.SmsService])
], TwilioWebhookController);
//# sourceMappingURL=twilio-webhook.controller.js.map