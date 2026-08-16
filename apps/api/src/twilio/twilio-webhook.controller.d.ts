import * as express from 'express';
import { CallFlowService } from '../call-flow/call-flow.service';
import { TwimlGeneratorService } from '../call-flow/twiml-generator.service';
import { PhoneCallService } from '../phone-call/phone-call.service';
import { SmsService } from '../sms/sms.service';
interface TwilioVoiceWebhookDto {
    CallSid: string;
    AccountSid: string;
    From: string;
    To: string;
    CallStatus: string;
    ApiVersion: string;
    Direction: string;
    ForwardedFrom?: string;
    CallerName?: string;
    FromCity?: string;
    FromState?: string;
    FromZip?: string;
    FromCountry?: string;
    ToCity?: string;
    ToState?: string;
    ToZip?: string;
    ToCountry?: string;
    Digits?: string;
    DialCallStatus?: string;
    DialCallDuration?: string;
    RecordingUrl?: string;
    RecordingSid?: string;
    RecordingDuration?: string;
}
interface TwilioSmsWebhookDto {
    MessageSid: string;
    AccountSid: string;
    From: string;
    To: string;
    Body: string;
    NumMedia: string;
    NumSegments: string;
    SmsStatus?: string;
    ApiVersion: string;
    FromCity?: string;
    FromState?: string;
    FromZip?: string;
    FromCountry?: string;
    ToCity?: string;
    ToState?: string;
    ToZip?: string;
    ToCountry?: string;
    MediaUrl0?: string;
    MediaContentType0?: string;
}
interface TwilioStatusCallbackDto {
    CallSid?: string;
    MessageSid?: string;
    AccountSid: string;
    From: string;
    To: string;
    CallStatus?: string;
    MessageStatus?: string;
    CallDuration?: string;
    Timestamp?: string;
    ErrorCode?: string;
    ErrorMessage?: string;
}
export declare class TwilioWebhookController {
    private readonly callFlowService;
    private readonly twimlGenerator;
    private readonly phoneCallService;
    private readonly smsService;
    private readonly logger;
    constructor(callFlowService: CallFlowService, twimlGenerator: TwimlGeneratorService, phoneCallService: PhoneCallService, smsService: SmsService);
    private buildCallContext;
    handleIncomingVoice(tenantId: string, phoneId: string, payload: TwilioVoiceWebhookDto, twilioSignature: string, res: express.Response): Promise<void>;
    handleFlowContinuation(tenantId: string, phoneId: string, stepIndex: string, action: string, queryParams: Record<string, string>, payload: TwilioVoiceWebhookDto, res: express.Response): Promise<void>;
    handleDialStatus(tenantId: string, phoneId: string, stepIndex: string, payload: TwilioVoiceWebhookDto, res: express.Response): Promise<void>;
    handleNestedDialStatus(tenantId: string, phoneId: string, rrAttempt: string, payload: TwilioVoiceWebhookDto, res: express.Response): Promise<void>;
    private associateNestedDialUser;
    private associateAnsweringUser;
    private isUUID;
    private associateRoundRobinUser;
    handleVoiceStatus(tenantId: string, phoneId: string, payload: TwilioStatusCallbackDto, twilioSignature: string): Promise<{
        success: boolean;
    }>;
    handleVoicemailRecording(tenantId: string, callSid: string, payload: TwilioVoiceWebhookDto, res: express.Response): Promise<void>;
    handleTranscription(tenantId: string, callSid: string, payload: Record<string, string>): Promise<{
        success: boolean;
    }>;
    getRingTwiml(): any;
    handleRecordingStatus(tenantId: string, callSid: string, payload: Record<string, string>): Promise<{
        success: boolean;
    }>;
    handleSegmentRecordingStatus(tenantId: string, callSid: string, segmentNumber: string, payload: Record<string, string>): Promise<{
        success: boolean;
    }>;
    handleConferenceStatus(tenantId: string, callSid: string, segmentNumber: string, attempt: string, payload: Record<string, string>): Promise<{
        success: boolean;
    }>;
    handleAgentCallStatus(tenantId: string, callSid: string, segmentNumber: string, phoneId: string, step: string, attempt: string, payload: Record<string, string>): Promise<{
        success: boolean;
    }>;
    handleIncomingSms(tenantId: string, phoneId: string, payload: TwilioSmsWebhookDto, twilioSignature: string, res: express.Response): Promise<void>;
    handleSmsStatus(tenantId: string, phoneId: string, payload: TwilioStatusCallbackDto, twilioSignature: string): Promise<{
        success: boolean;
    }>;
}
export {};
