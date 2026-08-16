import { CallFlowStep } from './dto/call-flow.dto';
import { PrismaService } from '@htownautos/prisma';
export interface CallContext {
    tenantId: string;
    phoneNumberId: string;
    callSid: string;
    from: string;
    to: string;
    callFlowId: string;
    variables: Record<string, string>;
    tags: string[];
    recordCalls: boolean;
    segmentNumber?: number;
}
export declare function generateConferenceName(callSid: string, segmentNumber: number): string;
export interface StepExecutionResult {
    twiml: string;
    continueProcessing: boolean;
    nextStepIndex?: number;
}
export declare class TwimlGeneratorService {
    private readonly prisma;
    private readonly logger;
    private readonly baseUrl;
    constructor(prisma: PrismaService);
    private buildFlowUrl;
    private buildDialStatusUrl;
    private addMessage;
    private processGreeting;
    private isUserIdentity;
    private isUUID;
    private getUserEmailById;
    private buildClientIdentity;
    private processDial;
    private storeConferenceTarget;
    private processSimulcall;
    private processRoundRobin;
    private processMenu;
    private findMatchingScheduleBranch;
    private processKeypadEntry;
    private processVoicemail;
    private processHangup;
    executeStep(steps: CallFlowStep[], stepIndex: number, context: CallContext, webhookParams?: Record<string, string>): Promise<string>;
    generateHangupTwiml(): string;
    executeNestedSteps(steps: CallFlowStep[], stepIndex: number, context: CallContext): Promise<string>;
    private storeNestedFlowContext;
    private processNestedDial;
    private processNestedSimulcall;
    private processNestedRoundRobin;
    private storeNestedRoundRobinContext;
    handleNestedDialStatus(callSid: string, context: CallContext, callWasAnswered: boolean, rrAttempt?: number): Promise<string>;
    private processNestedRoundRobinRetry;
    handleMenuSelection(steps: CallFlowStep[], stepIndex: number, digit: string, context: CallContext): Promise<string>;
    handleDialStatus(steps: CallFlowStep[], stepIndex: number, dialCallStatus: string, context: CallContext): Promise<string>;
    generateDefaultTwiml(tenantId: string): string;
    startCallFlow(steps: CallFlowStep[], context: CallContext): Promise<string>;
    generateJoinConferenceTwiml(conferenceName: string, options?: {
        endConferenceOnExit?: boolean;
        muted?: boolean;
        startConferenceOnEnter?: boolean;
    }): string;
    generateTransferToConferenceTwiml(conferenceName: string, tenantId: string, callSid: string, segmentNumber: number, shouldRecord: boolean): string;
}
