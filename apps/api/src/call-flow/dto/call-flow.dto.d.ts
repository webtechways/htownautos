export declare enum CallFlowStepType {
    GREETING = "greeting",
    DIAL = "dial",
    SIMULCALL = "simulcall",
    ROUND_ROBIN = "round_robin",
    MENU = "menu",
    SCHEDULE = "schedule",
    KEYPAD_ENTRY = "keypad_entry",
    TAG = "tag",
    VOICEMAIL = "voicemail",
    HANGUP = "hangup"
}
export declare const TERMINAL_STEP_TYPES: CallFlowStepType[];
export declare enum MessageType {
    TTS = "tts",
    RECORDING = "recording"
}
export declare enum TtsVoice {
    ALLOY = "alloy",
    ASH = "ash",
    BALLAD = "ballad",
    CEDAR = "cedar",
    CORAL = "coral",
    ECHO = "echo",
    FABLE = "fable",
    MARIN = "marin",
    NOVA = "nova",
    ONYX = "onyx",
    SAGE = "sage",
    SHIMMER = "shimmer"
}
export declare enum TtsLanguage {
    EN_US = "en-US",
    EN_GB = "en-GB",
    ES_ES = "es-ES",
    ES_MX = "es-MX",
    FR_FR = "fr-FR"
}
export declare class MessageConfig {
    type: MessageType;
    text?: string;
    recordingUrl?: string;
    voice?: TtsVoice;
    language?: TtsLanguage;
    generatedAudioUrl?: string;
}
export declare class GreetingStepConfig {
    message: MessageConfig;
}
export declare class DialStepConfig {
    destination: string;
    isExtension?: boolean;
    timeout?: number;
    callerId?: string;
    record?: boolean;
}
export declare class SimulcallStepConfig {
    destinations: string[];
    timeout?: number;
    callerId?: string;
}
export declare class RoundRobinStepConfig {
    destinations: string[];
    timeoutPerDestination?: number;
    callerId?: string;
}
export declare class MenuOption {
    digit: string;
    label: string;
    steps?: CallFlowStep[];
}
export declare class MenuStepConfig {
    message: MessageConfig;
    options: MenuOption[];
    numDigits?: number;
    timeout?: number;
    retries?: number;
    invalidInputSteps?: CallFlowStep[];
}
export declare class ScheduleTimeSlot {
    days: 'weekdays' | 'weekends' | 'everyday' | number[];
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
}
export declare class ScheduleBranch {
    id: string;
    name: string;
    timeSlots: ScheduleTimeSlot[];
    steps?: CallFlowStep[];
}
export declare class ScheduleStepConfig {
    timezone: string;
    branches: ScheduleBranch[];
    fallbackSteps: CallFlowStep[];
}
export declare class KeypadEntryStepConfig {
    message: MessageConfig;
    variableName?: string;
    maxDigits?: number;
    minDigits?: number;
    finishOnKey?: boolean;
    timeout?: number;
}
export declare class TagStepConfig {
    tagName: string;
    tagValue?: string;
}
export declare class VoicemailStepConfig {
    greeting?: MessageConfig;
    notificationEmail?: string;
    maxLength?: number;
    transcribe?: boolean;
}
export declare class HangupStepConfig {
    message?: MessageConfig;
}
export declare class CallFlowStep {
    id: string;
    type: CallFlowStepType;
    label?: string;
    config: Record<string, any>;
}
export declare class CreateCallFlowDto {
    name: string;
    description?: string;
    isActive?: boolean;
    recordInboundCalls?: boolean;
    steps?: CallFlowStep[];
}
export declare class UpdateCallFlowDto {
    name?: string;
    description?: string;
    isActive?: boolean;
    recordInboundCalls?: boolean;
    steps?: CallFlowStep[];
}
export declare class AssignCallFlowDto {
    callFlowId: string;
}
export declare class CallFlowResponseDto {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    isActive: boolean;
    recordInboundCalls: boolean;
    steps: CallFlowStep[];
    createdAt: Date;
    updatedAt: Date;
    phoneNumberCount?: number;
}
