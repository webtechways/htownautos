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
var TwimlGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwimlGeneratorService = void 0;
exports.generateConferenceName = generateConferenceName;
const common_1 = require("@nestjs/common");
const twilio = __importStar(require("twilio"));
const call_flow_dto_1 = require("./dto/call-flow.dto");
const prisma_1 = require("@htownautos/prisma");
const VoiceResponse = twilio.twiml.VoiceResponse;
function generateConferenceName(callSid, segmentNumber) {
    return `call_${callSid}_seg_${segmentNumber}`;
}
let TwimlGeneratorService = TwimlGeneratorService_1 = class TwimlGeneratorService {
    prisma;
    logger = new common_1.Logger(TwimlGeneratorService_1.name);
    baseUrl;
    constructor(prisma) {
        this.prisma = prisma;
        this.baseUrl = process.env.API_BASE_URL || 'https://api.htownautos.com';
    }
    buildFlowUrl(tenantId, phoneNumberId, stepIndex, extra = {}) {
        const params = new URLSearchParams({ step: stepIndex.toString(), ...extra });
        return `${this.baseUrl}/api/v1/twilio/voice/flow/${tenantId}/${phoneNumberId}?${params}`;
    }
    buildDialStatusUrl(tenantId, phoneNumberId, stepIndex) {
        return `${this.baseUrl}/api/v1/twilio/voice/flow/${tenantId}/${phoneNumberId}/dial-status?step=${stepIndex}`;
    }
    addMessage(response, message) {
        if (message.type === call_flow_dto_1.MessageType.RECORDING && message.recordingUrl) {
            response.play(message.recordingUrl);
        }
        else if (message.type === call_flow_dto_1.MessageType.TTS) {
            if (message.generatedAudioUrl) {
                response.play(message.generatedAudioUrl);
            }
            else if (message.text) {
                response.say({
                    voice: 'alice',
                    language: message.language || 'en-US',
                }, message.text);
            }
        }
    }
    processGreeting(response, config) {
        this.addMessage(response, config.message);
    }
    isUserIdentity(destination) {
        return destination.includes('@');
    }
    isUUID(destination) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(destination);
    }
    async getUserEmailById(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true },
            });
            return user?.email || null;
        }
        catch (error) {
            this.logger.error(`Failed to lookup user ${userId}: ${error.message}`);
            return null;
        }
    }
    buildClientIdentity(userId, tenantId) {
        return `${tenantId}:${userId}`;
    }
    async processDial(response, config, context, stepIndex) {
        this.logger.log(`processDial - destination: "${config.destination}", isUserIdentity: ${this.isUserIdentity(config.destination)}, isUUID: ${this.isUUID(config.destination)}, isExtension: ${config.isExtension}`);
        const shouldRecord = config.record || context.recordCalls;
        const segmentNumber = context.segmentNumber || 0;
        const conferenceName = generateConferenceName(context.callSid, segmentNumber);
        this.logger.log(`Using conference: ${conferenceName}, segment: ${segmentNumber}, recording: ${shouldRecord}`);
        const conferenceOptions = {
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
            waitUrl: `${this.baseUrl}/api/v1/twilio/voice/ring`,
            waitMethod: 'GET',
            statusCallback: `${this.baseUrl}/api/v1/twilio/voice/conference/${context.tenantId}/${context.callSid}/${segmentNumber}`,
            statusCallbackEvent: ['start', 'end', 'join', 'leave'],
            statusCallbackMethod: 'POST',
        };
        if (shouldRecord) {
            conferenceOptions.record = 'record-from-start';
            conferenceOptions.recordingStatusCallback = `${this.baseUrl}/api/v1/twilio/voice/recording/${context.tenantId}/${context.callSid}/${segmentNumber}`;
            conferenceOptions.recordingStatusCallbackMethod = 'POST';
            this.logger.log(`Conference recording enabled for segment ${segmentNumber}`);
        }
        const dialOptions = {
            timeout: config.timeout || 30,
            action: this.buildDialStatusUrl(context.tenantId, context.phoneNumberId, stepIndex),
            method: 'POST',
        };
        const dial = response.dial(dialOptions);
        dial.conference(conferenceOptions, conferenceName);
        await this.storeConferenceTarget(context, conferenceName, config.destination, segmentNumber, stepIndex, undefined, config.timeout);
    }
    async storeConferenceTarget(context, conferenceName, destination, segmentNumber, stepIndex, attemptIndex, timeout) {
        try {
            this.logger.log(`storeConferenceTarget: callSid=${context.callSid}, destination=${destination}, segmentNumber=${segmentNumber}, timeout=${timeout}`);
            const existingCall = await this.prisma.phoneCall.findFirst({
                where: { twilioCallSid: context.callSid },
            });
            if (!existingCall) {
                this.logger.warn(`storeConferenceTarget: No call record found for callSid=${context.callSid} - call record may not exist yet`);
                return;
            }
            const existingMetaValue = existingCall.metaValue || {};
            const newMetaValue = {
                ...existingMetaValue,
                conferenceTarget: destination,
                conferenceCallerId: context.from,
                phoneNumberId: context.phoneNumberId,
                stepIndex,
                attemptIndex,
                dialTimeout: timeout,
            };
            await this.prisma.phoneCall.update({
                where: { id: existingCall.id },
                data: {
                    conferenceName,
                    segmentNumber,
                    metaValue: newMetaValue,
                },
            });
            this.logger.log(`storeConferenceTarget: updated call ${existingCall.id} with conferenceTarget=${destination}`);
        }
        catch (error) {
            this.logger.error(`Failed to store conference target: ${error.message}`);
        }
    }
    async processSimulcall(response, config, context, stepIndex) {
        const segmentNumber = context.segmentNumber || 0;
        const conferenceName = generateConferenceName(context.callSid, segmentNumber);
        this.logger.log(`Simulcall using conference: ${conferenceName}, segment: ${segmentNumber}`);
        const conferenceOptions = {
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
            waitUrl: `${this.baseUrl}/api/v1/twilio/voice/ring`,
            waitMethod: 'GET',
            statusCallback: `${this.baseUrl}/api/v1/twilio/voice/conference/${context.tenantId}/${context.callSid}/${segmentNumber}`,
            statusCallbackEvent: ['start', 'end', 'join', 'leave'],
            statusCallbackMethod: 'POST',
        };
        if (context.recordCalls) {
            conferenceOptions.record = 'record-from-start';
            conferenceOptions.recordingStatusCallback = `${this.baseUrl}/api/v1/twilio/voice/recording/${context.tenantId}/${context.callSid}/${segmentNumber}`;
            conferenceOptions.recordingStatusCallbackMethod = 'POST';
            this.logger.log(`Conference recording enabled for simulcall segment ${segmentNumber}`);
        }
        const dialOptions = {
            timeout: config.timeout || 30,
            action: this.buildDialStatusUrl(context.tenantId, context.phoneNumberId, stepIndex),
            method: 'POST',
        };
        const dial = response.dial(dialOptions);
        dial.conference(conferenceOptions, conferenceName);
        await this.storeConferenceTarget(context, conferenceName, config.destinations.join(','), segmentNumber, stepIndex, undefined, config.timeout);
    }
    async processRoundRobin(response, config, context, stepIndex, attemptIndex = 0) {
        if (attemptIndex >= config.destinations.length) {
            response.redirect({ method: 'POST' }, this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex + 1));
            return;
        }
        const segmentNumber = context.segmentNumber || 0;
        const conferenceName = generateConferenceName(context.callSid, segmentNumber);
        const destination = config.destinations[attemptIndex];
        this.logger.log(`RoundRobin using conference: ${conferenceName}, attempt: ${attemptIndex}, destination: ${destination}`);
        const conferenceOptions = {
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
            waitUrl: `${this.baseUrl}/api/v1/twilio/voice/ring`,
            waitMethod: 'GET',
            statusCallback: `${this.baseUrl}/api/v1/twilio/voice/conference/${context.tenantId}/${context.callSid}/${segmentNumber}?attempt=${attemptIndex}`,
            statusCallbackEvent: ['start', 'end', 'join', 'leave'],
            statusCallbackMethod: 'POST',
        };
        if (context.recordCalls) {
            conferenceOptions.record = 'record-from-start';
            conferenceOptions.recordingStatusCallback = `${this.baseUrl}/api/v1/twilio/voice/recording/${context.tenantId}/${context.callSid}/${segmentNumber}`;
            conferenceOptions.recordingStatusCallbackMethod = 'POST';
            this.logger.log(`Conference recording enabled for round robin segment ${segmentNumber}`);
        }
        const dialOptions = {
            timeout: config.timeoutPerDestination || 20,
            action: this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex, {
                action: 'round_robin',
                attempt: (attemptIndex + 1).toString(),
            }),
            method: 'POST',
        };
        const dial = response.dial(dialOptions);
        dial.conference(conferenceOptions, conferenceName);
        await this.storeConferenceTarget(context, conferenceName, destination, segmentNumber, stepIndex, attemptIndex, config.timeoutPerDestination);
    }
    processMenu(response, config, context, stepIndex) {
        const gather = response.gather({
            input: ['dtmf'],
            numDigits: config.numDigits || 1,
            timeout: config.timeout || 20,
            action: this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex, {
                action: 'menu',
            }),
            method: 'POST',
        });
        if (config.message.type === call_flow_dto_1.MessageType.RECORDING && config.message.recordingUrl) {
            gather.play(config.message.recordingUrl);
        }
        else if (config.message.type === call_flow_dto_1.MessageType.TTS) {
            if (config.message.generatedAudioUrl) {
                gather.play(config.message.generatedAudioUrl);
            }
            else if (config.message.text) {
                gather.say({
                    voice: 'alice',
                    language: config.message.language || 'en-US',
                }, config.message.text);
            }
        }
        response.redirect({ method: 'POST' }, this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex, {
            action: 'menu_invalid',
        }));
    }
    findMatchingScheduleBranch(config) {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: config.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            weekday: 'short',
        });
        const parts = formatter.formatToParts(now);
        const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
        const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
        const dayName = parts.find(p => p.type === 'weekday')?.value || '';
        const dayMap = {
            Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
        };
        const dayOfWeek = dayMap[dayName] ?? 0;
        const currentTime = hour * 60 + minute;
        const weekdays = [1, 2, 3, 4, 5];
        const weekends = [0, 6];
        const everyday = [0, 1, 2, 3, 4, 5, 6];
        for (let branchIdx = 0; branchIdx < (config.branches?.length || 0); branchIdx++) {
            const branch = config.branches[branchIdx];
            for (const slot of branch.timeSlots || []) {
                let applicableDays;
                if (typeof slot.days === 'string') {
                    switch (slot.days) {
                        case 'weekdays':
                            applicableDays = weekdays;
                            break;
                        case 'weekends':
                            applicableDays = weekends;
                            break;
                        case 'everyday':
                            applicableDays = everyday;
                            break;
                        default: applicableDays = [];
                    }
                }
                else {
                    applicableDays = slot.days || [];
                }
                if (!applicableDays.includes(dayOfWeek)) {
                    continue;
                }
                if (slot.allDay) {
                    return branchIdx;
                }
                if (slot.startTime && slot.endTime) {
                    const [startHour, startMin] = slot.startTime.split(':').map(Number);
                    const [endHour, endMin] = slot.endTime.split(':').map(Number);
                    const startTime = startHour * 60 + startMin;
                    const endTime = endHour * 60 + endMin;
                    if (currentTime >= startTime && currentTime < endTime) {
                        return branchIdx;
                    }
                }
            }
        }
        return -1;
    }
    processKeypadEntry(response, config, context, stepIndex) {
        const gather = response.gather({
            input: ['dtmf'],
            numDigits: config.maxDigits || 10,
            timeout: config.timeout || 5,
            finishOnKey: config.finishOnKey !== false ? '#' : '',
            action: this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex, {
                action: 'keypad',
                var: config.variableName || 'keypad_input',
            }),
            method: 'POST',
        });
        if (config.message.type === call_flow_dto_1.MessageType.RECORDING && config.message.recordingUrl) {
            gather.play(config.message.recordingUrl);
        }
        else if (config.message.type === call_flow_dto_1.MessageType.TTS) {
            if (config.message.generatedAudioUrl) {
                gather.play(config.message.generatedAudioUrl);
            }
            else if (config.message.text) {
                gather.say({
                    voice: 'alice',
                    language: config.message.language || 'en-US',
                }, config.message.text);
            }
        }
        response.redirect({ method: 'POST' }, this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex + 1));
    }
    processVoicemail(response, config, context) {
        if (config.greeting) {
            this.addMessage(response, config.greeting);
        }
        else {
            response.say({ voice: 'alice' }, 'Please leave a message after the beep.');
        }
        response.record({
            maxLength: config.maxLength || 20,
            timeout: 3,
            transcribe: config.transcribe !== false,
            transcribeCallback: `${this.baseUrl}/api/v1/twilio/voice/transcription/${context.tenantId}/${context.callSid}`,
            action: `${this.baseUrl}/api/v1/twilio/voice/voicemail/${context.tenantId}/${context.callSid}`,
            method: 'POST',
            playBeep: true,
            finishOnKey: '#',
        });
        response.hangup();
    }
    processHangup(response, config) {
        if (config.message) {
            this.addMessage(response, config.message);
        }
        response.hangup();
    }
    async executeStep(steps, stepIndex, context, webhookParams = {}) {
        const response = new VoiceResponse();
        if (stepIndex >= steps.length) {
            response.say({ voice: 'alice' }, 'Goodbye.');
            response.hangup();
            return response.toString();
        }
        const step = steps[stepIndex];
        this.logger.debug(`Executing step ${stepIndex}: ${step.type} (${step.id})`);
        switch (step.type) {
            case call_flow_dto_1.CallFlowStepType.GREETING: {
                this.processGreeting(response, step.config);
                response.redirect({ method: 'POST' }, this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex + 1));
                break;
            }
            case call_flow_dto_1.CallFlowStepType.DIAL: {
                await this.processDial(response, step.config, context, stepIndex);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.SIMULCALL: {
                await this.processSimulcall(response, step.config, context, stepIndex);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.ROUND_ROBIN: {
                const attempt = parseInt(webhookParams.attempt || '0', 10);
                await this.processRoundRobin(response, step.config, context, stepIndex, attempt);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.MENU: {
                this.processMenu(response, step.config, context, stepIndex);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.SCHEDULE: {
                const config = step.config;
                const matchingBranchIdx = this.findMatchingScheduleBranch(config);
                let branchSteps;
                if (matchingBranchIdx >= 0 && config.branches?.[matchingBranchIdx]) {
                    branchSteps = config.branches[matchingBranchIdx].steps;
                }
                else {
                    branchSteps = config.fallbackSteps;
                }
                if (branchSteps && branchSteps.length > 0) {
                    return this.executeNestedSteps(branchSteps, 0, context);
                }
                else {
                    response.redirect({ method: 'POST' }, this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex + 1));
                }
                break;
            }
            case call_flow_dto_1.CallFlowStepType.KEYPAD_ENTRY: {
                this.processKeypadEntry(response, step.config, context, stepIndex);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.TAG: {
                const config = step.config;
                context.tags.push(config.tagName);
                response.redirect({ method: 'POST' }, this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex + 1));
                break;
            }
            case call_flow_dto_1.CallFlowStepType.VOICEMAIL: {
                this.processVoicemail(response, step.config, context);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.HANGUP: {
                this.processHangup(response, step.config);
                break;
            }
            default:
                this.logger.warn(`Unknown step type: ${step.type}`);
                response.redirect({ method: 'POST' }, this.buildFlowUrl(context.tenantId, context.phoneNumberId, stepIndex + 1));
        }
        return response.toString();
    }
    generateHangupTwiml() {
        const response = new VoiceResponse();
        response.hangup();
        return response.toString();
    }
    async executeNestedSteps(steps, stepIndex, context) {
        const response = new VoiceResponse();
        if (stepIndex >= steps.length) {
            response.hangup();
            return response.toString();
        }
        const step = steps[stepIndex];
        switch (step.type) {
            case call_flow_dto_1.CallFlowStepType.GREETING: {
                this.processGreeting(response, step.config);
                const remainingTwiml = await this.executeNestedSteps(steps, stepIndex + 1, context);
                return response.toString().replace('</Response>', '') +
                    remainingTwiml.replace('<?xml version="1.0" encoding="UTF-8"?>', '').replace('<Response>', '');
            }
            case call_flow_dto_1.CallFlowStepType.VOICEMAIL: {
                this.processVoicemail(response, step.config, context);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.HANGUP: {
                this.processHangup(response, step.config);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.DIAL: {
                const remainingSteps = steps.slice(stepIndex + 1);
                await this.storeNestedFlowContext(context, remainingSteps);
                await this.processNestedDial(response, step.config, context);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.SIMULCALL: {
                const remainingSteps = steps.slice(stepIndex + 1);
                await this.storeNestedFlowContext(context, remainingSteps);
                await this.processNestedSimulcall(response, step.config, context);
                break;
            }
            case call_flow_dto_1.CallFlowStepType.ROUND_ROBIN: {
                const remainingSteps = steps.slice(stepIndex + 1);
                await this.storeNestedFlowContext(context, remainingSteps);
                await this.processNestedRoundRobin(response, step.config, context, 0);
                break;
            }
            default:
                this.logger.warn(`Nested step type ${step.type} not fully supported yet`);
                response.hangup();
        }
        return response.toString();
    }
    async storeNestedFlowContext(context, remainingSteps) {
        try {
            const call = await this.prisma.phoneCall.findFirst({
                where: { twilioCallSid: context.callSid },
            });
            if (call) {
                const metaValue = call.metaValue || {};
                await this.prisma.phoneCall.update({
                    where: { id: call.id },
                    data: {
                        metaValue: {
                            ...metaValue,
                            nestedFlowSteps: remainingSteps,
                            isNestedFlow: true,
                        },
                    },
                });
                this.logger.log(`Stored nested flow context with ${remainingSteps.length} remaining steps`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to store nested flow context: ${error.message}`);
        }
    }
    async processNestedDial(response, config, context) {
        const shouldRecord = config.record || context.recordCalls;
        const segmentNumber = context.segmentNumber || 0;
        const conferenceName = generateConferenceName(context.callSid, segmentNumber);
        this.logger.log(`processNestedDial - destination: "${config.destination}", conference: ${conferenceName}`);
        const conferenceOptions = {
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
            waitUrl: `${this.baseUrl}/api/v1/twilio/voice/ring`,
            waitMethod: 'GET',
            statusCallback: `${this.baseUrl}/api/v1/twilio/voice/conference/${context.tenantId}/${context.callSid}/${segmentNumber}`,
            statusCallbackEvent: ['start', 'end', 'join', 'leave'],
            statusCallbackMethod: 'POST',
        };
        if (shouldRecord) {
            conferenceOptions.record = 'record-from-start';
            conferenceOptions.recordingStatusCallback = `${this.baseUrl}/api/v1/twilio/voice/recording/${context.tenantId}/${context.callSid}/${segmentNumber}`;
            conferenceOptions.recordingStatusCallbackMethod = 'POST';
        }
        const dialOptions = {
            timeout: config.timeout || 30,
            action: `${this.baseUrl}/api/v1/twilio/voice/flow/${context.tenantId}/${context.phoneNumberId}/nested-dial-status`,
            method: 'POST',
        };
        const dial = response.dial(dialOptions);
        dial.conference(conferenceOptions, conferenceName);
        await this.storeConferenceTarget(context, conferenceName, config.destination, segmentNumber, undefined, undefined, config.timeout);
    }
    async processNestedSimulcall(response, config, context) {
        const shouldRecord = context.recordCalls;
        const segmentNumber = context.segmentNumber || 0;
        const conferenceName = generateConferenceName(context.callSid, segmentNumber);
        this.logger.log(`processNestedSimulcall - destinations: ${config.destinations.join(', ')}`);
        const conferenceOptions = {
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
            waitUrl: `${this.baseUrl}/api/v1/twilio/voice/ring`,
            waitMethod: 'GET',
            statusCallback: `${this.baseUrl}/api/v1/twilio/voice/conference/${context.tenantId}/${context.callSid}/${segmentNumber}`,
            statusCallbackEvent: ['start', 'end', 'join', 'leave'],
            statusCallbackMethod: 'POST',
        };
        if (shouldRecord) {
            conferenceOptions.record = 'record-from-start';
            conferenceOptions.recordingStatusCallback = `${this.baseUrl}/api/v1/twilio/voice/recording/${context.tenantId}/${context.callSid}/${segmentNumber}`;
            conferenceOptions.recordingStatusCallbackMethod = 'POST';
        }
        const dialOptions = {
            timeout: config.timeout || 30,
            action: `${this.baseUrl}/api/v1/twilio/voice/flow/${context.tenantId}/${context.phoneNumberId}/nested-dial-status`,
            method: 'POST',
        };
        const dial = response.dial(dialOptions);
        dial.conference(conferenceOptions, conferenceName);
        await this.storeConferenceTarget(context, conferenceName, config.destinations.join(','), segmentNumber, undefined, undefined, config.timeout);
    }
    async processNestedRoundRobin(response, config, context, attemptIndex) {
        if (attemptIndex >= config.destinations.length) {
            const call = await this.prisma.phoneCall.findFirst({
                where: { twilioCallSid: context.callSid },
            });
            const metaValue = call?.metaValue || {};
            const remainingSteps = metaValue.nestedFlowSteps;
            if (remainingSteps?.length) {
                response.hangup();
                return;
            }
            response.hangup();
            return;
        }
        const destination = config.destinations[attemptIndex];
        const shouldRecord = context.recordCalls;
        const segmentNumber = context.segmentNumber || 0;
        const conferenceName = generateConferenceName(context.callSid, segmentNumber);
        this.logger.log(`processNestedRoundRobin - attempt ${attemptIndex + 1}/${config.destinations.length}, destination: ${destination}`);
        const conferenceOptions = {
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
            waitUrl: `${this.baseUrl}/api/v1/twilio/voice/ring`,
            waitMethod: 'GET',
            statusCallback: `${this.baseUrl}/api/v1/twilio/voice/conference/${context.tenantId}/${context.callSid}/${segmentNumber}`,
            statusCallbackEvent: ['start', 'end', 'join', 'leave'],
            statusCallbackMethod: 'POST',
        };
        if (shouldRecord) {
            conferenceOptions.record = 'record-from-start';
            conferenceOptions.recordingStatusCallback = `${this.baseUrl}/api/v1/twilio/voice/recording/${context.tenantId}/${context.callSid}/${segmentNumber}`;
            conferenceOptions.recordingStatusCallbackMethod = 'POST';
        }
        await this.storeNestedRoundRobinContext(context, config.destinations, attemptIndex);
        const dialOptions = {
            timeout: config.timeoutPerDestination || 20,
            action: `${this.baseUrl}/api/v1/twilio/voice/flow/${context.tenantId}/${context.phoneNumberId}/nested-dial-status?rrAttempt=${attemptIndex}`,
            method: 'POST',
        };
        const dial = response.dial(dialOptions);
        dial.conference(conferenceOptions, conferenceName);
        await this.storeConferenceTarget(context, conferenceName, destination, segmentNumber, undefined, attemptIndex, config.timeoutPerDestination);
    }
    async storeNestedRoundRobinContext(context, destinations, currentAttempt) {
        try {
            const call = await this.prisma.phoneCall.findFirst({
                where: { twilioCallSid: context.callSid },
            });
            if (call) {
                const metaValue = call.metaValue || {};
                await this.prisma.phoneCall.update({
                    where: { id: call.id },
                    data: {
                        metaValue: {
                            ...metaValue,
                            nestedRoundRobin: {
                                destinations,
                                currentAttempt,
                                timeoutPerDestination: 20,
                            },
                        },
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to store nested round robin context: ${error.message}`);
        }
    }
    async handleNestedDialStatus(callSid, context, callWasAnswered, rrAttempt) {
        const response = new VoiceResponse();
        if (callWasAnswered) {
            response.hangup();
            return response.toString();
        }
        const call = await this.prisma.phoneCall.findFirst({
            where: { twilioCallSid: callSid },
        });
        if (!call) {
            response.hangup();
            return response.toString();
        }
        const metaValue = call.metaValue || {};
        if (rrAttempt !== undefined && metaValue.nestedRoundRobin) {
            const { destinations, timeoutPerDestination } = metaValue.nestedRoundRobin;
            const nextAttempt = rrAttempt + 1;
            if (nextAttempt < destinations.length) {
                this.logger.log(`Nested round robin: trying next destination (attempt ${nextAttempt + 1}/${destinations.length})`);
                return this.processNestedRoundRobinRetry(context, destinations, nextAttempt, timeoutPerDestination);
            }
        }
        const remainingSteps = metaValue.nestedFlowSteps;
        if (remainingSteps?.length) {
            this.logger.log(`Executing ${remainingSteps.length} remaining nested steps`);
            return this.executeNestedSteps(remainingSteps, 0, context);
        }
        response.hangup();
        return response.toString();
    }
    async processNestedRoundRobinRetry(context, destinations, attemptIndex, timeoutPerDestination) {
        const response = new VoiceResponse();
        const destination = destinations[attemptIndex];
        const segmentNumber = context.segmentNumber || 0;
        const conferenceName = generateConferenceName(context.callSid, segmentNumber);
        this.logger.log(`processNestedRoundRobinRetry - attempt ${attemptIndex + 1}/${destinations.length}, destination: ${destination}`);
        const conferenceOptions = {
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
            waitUrl: `${this.baseUrl}/api/v1/twilio/voice/ring`,
            waitMethod: 'GET',
            statusCallback: `${this.baseUrl}/api/v1/twilio/voice/conference/${context.tenantId}/${context.callSid}/${segmentNumber}`,
            statusCallbackEvent: ['start', 'end', 'join', 'leave'],
            statusCallbackMethod: 'POST',
        };
        if (context.recordCalls) {
            conferenceOptions.record = 'record-from-start';
            conferenceOptions.recordingStatusCallback = `${this.baseUrl}/api/v1/twilio/voice/recording/${context.tenantId}/${context.callSid}/${segmentNumber}`;
            conferenceOptions.recordingStatusCallbackMethod = 'POST';
        }
        await this.storeNestedRoundRobinContext(context, destinations, attemptIndex);
        const dialOptions = {
            timeout: timeoutPerDestination,
            action: `${this.baseUrl}/api/v1/twilio/voice/flow/${context.tenantId}/${context.phoneNumberId}/nested-dial-status?rrAttempt=${attemptIndex}`,
            method: 'POST',
        };
        const dial = response.dial(dialOptions);
        dial.conference(conferenceOptions, conferenceName);
        await this.storeConferenceTarget(context, conferenceName, destination, segmentNumber, undefined, attemptIndex, timeoutPerDestination);
        return response.toString();
    }
    async handleMenuSelection(steps, stepIndex, digit, context) {
        const step = steps[stepIndex];
        if (step.type !== call_flow_dto_1.CallFlowStepType.MENU) {
            return this.executeStep(steps, stepIndex + 1, context);
        }
        const config = step.config;
        const selectedOption = config.options.find(o => o.digit === digit);
        if (!selectedOption) {
            if (config.invalidInputSteps?.length) {
                return this.executeNestedSteps(config.invalidInputSteps, 0, context);
            }
            return this.generateHangupTwiml();
        }
        if (selectedOption.steps?.length) {
            return this.executeNestedSteps(selectedOption.steps, 0, context);
        }
        return this.executeStep(steps, stepIndex + 1, context);
    }
    async handleDialStatus(steps, stepIndex, dialCallStatus, context) {
        if (dialCallStatus === 'completed') {
            const response = new VoiceResponse();
            response.hangup();
            return response.toString();
        }
        return this.executeStep(steps, stepIndex + 1, context);
    }
    generateDefaultTwiml(tenantId) {
        const response = new VoiceResponse();
        response.say({ voice: 'alice' }, 'Thank you for calling. We are currently unavailable. Please try again later.');
        response.hangup();
        return response.toString();
    }
    async startCallFlow(steps, context) {
        if (!steps || steps.length === 0) {
            return this.generateDefaultTwiml(context.tenantId);
        }
        return this.executeStep(steps, 0, context);
    }
    generateJoinConferenceTwiml(conferenceName, options = {}) {
        const response = new VoiceResponse();
        const dial = response.dial();
        dial.conference({
            startConferenceOnEnter: options.startConferenceOnEnter ?? true,
            endConferenceOnExit: options.endConferenceOnExit ?? false,
            muted: options.muted ?? false,
            beep: 'false',
        }, conferenceName);
        return response.toString();
    }
    generateTransferToConferenceTwiml(conferenceName, tenantId, callSid, segmentNumber, shouldRecord) {
        const response = new VoiceResponse();
        const conferenceOptions = {
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            beep: false,
            waitUrl: '',
            statusCallback: `${this.baseUrl}/api/v1/twilio/voice/conference/${tenantId}/${callSid}/${segmentNumber}`,
            statusCallbackEvent: ['start', 'end', 'join', 'leave'],
            statusCallbackMethod: 'POST',
        };
        if (shouldRecord) {
            conferenceOptions.record = 'record-from-start';
            conferenceOptions.recordingStatusCallback = `${this.baseUrl}/api/v1/twilio/voice/recording/${tenantId}/${callSid}/${segmentNumber}`;
            conferenceOptions.recordingStatusCallbackMethod = 'POST';
        }
        const dial = response.dial();
        dial.conference(conferenceOptions, conferenceName);
        return response.toString();
    }
};
exports.TwimlGeneratorService = TwimlGeneratorService;
exports.TwimlGeneratorService = TwimlGeneratorService = TwimlGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], TwimlGeneratorService);
//# sourceMappingURL=twiml-generator.service.js.map