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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallFlowResponseDto = exports.AssignCallFlowDto = exports.UpdateCallFlowDto = exports.CreateCallFlowDto = exports.CallFlowStep = exports.HangupStepConfig = exports.VoicemailStepConfig = exports.TagStepConfig = exports.KeypadEntryStepConfig = exports.ScheduleStepConfig = exports.ScheduleBranch = exports.ScheduleTimeSlot = exports.MenuStepConfig = exports.MenuOption = exports.RoundRobinStepConfig = exports.SimulcallStepConfig = exports.DialStepConfig = exports.GreetingStepConfig = exports.MessageConfig = exports.TtsLanguage = exports.TtsVoice = exports.MessageType = exports.TERMINAL_STEP_TYPES = exports.CallFlowStepType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var CallFlowStepType;
(function (CallFlowStepType) {
    CallFlowStepType["GREETING"] = "greeting";
    CallFlowStepType["DIAL"] = "dial";
    CallFlowStepType["SIMULCALL"] = "simulcall";
    CallFlowStepType["ROUND_ROBIN"] = "round_robin";
    CallFlowStepType["MENU"] = "menu";
    CallFlowStepType["SCHEDULE"] = "schedule";
    CallFlowStepType["KEYPAD_ENTRY"] = "keypad_entry";
    CallFlowStepType["TAG"] = "tag";
    CallFlowStepType["VOICEMAIL"] = "voicemail";
    CallFlowStepType["HANGUP"] = "hangup";
})(CallFlowStepType || (exports.CallFlowStepType = CallFlowStepType = {}));
exports.TERMINAL_STEP_TYPES = [
    CallFlowStepType.VOICEMAIL,
    CallFlowStepType.HANGUP,
];
var MessageType;
(function (MessageType) {
    MessageType["TTS"] = "tts";
    MessageType["RECORDING"] = "recording";
})(MessageType || (exports.MessageType = MessageType = {}));
var TtsVoice;
(function (TtsVoice) {
    TtsVoice["ALLOY"] = "alloy";
    TtsVoice["ASH"] = "ash";
    TtsVoice["BALLAD"] = "ballad";
    TtsVoice["CEDAR"] = "cedar";
    TtsVoice["CORAL"] = "coral";
    TtsVoice["ECHO"] = "echo";
    TtsVoice["FABLE"] = "fable";
    TtsVoice["MARIN"] = "marin";
    TtsVoice["NOVA"] = "nova";
    TtsVoice["ONYX"] = "onyx";
    TtsVoice["SAGE"] = "sage";
    TtsVoice["SHIMMER"] = "shimmer";
})(TtsVoice || (exports.TtsVoice = TtsVoice = {}));
var TtsLanguage;
(function (TtsLanguage) {
    TtsLanguage["EN_US"] = "en-US";
    TtsLanguage["EN_GB"] = "en-GB";
    TtsLanguage["ES_ES"] = "es-ES";
    TtsLanguage["ES_MX"] = "es-MX";
    TtsLanguage["FR_FR"] = "fr-FR";
})(TtsLanguage || (exports.TtsLanguage = TtsLanguage = {}));
class MessageConfig {
    type;
    text;
    recordingUrl;
    voice;
    language;
    generatedAudioUrl;
}
exports.MessageConfig = MessageConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: MessageType }),
    (0, class_validator_1.IsEnum)(MessageType),
    __metadata("design:type", String)
], MessageConfig.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Text to speak (for TTS)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessageConfig.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL to audio recording' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessageConfig.prototype, "recordingUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TtsVoice, default: TtsVoice.ECHO }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TtsVoice),
    __metadata("design:type", String)
], MessageConfig.prototype, "voice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TtsLanguage, default: TtsLanguage.EN_US }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TtsLanguage),
    __metadata("design:type", String)
], MessageConfig.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cached TTS audio URL (generated from text+voice)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MessageConfig.prototype, "generatedAudioUrl", void 0);
class GreetingStepConfig {
    message;
}
exports.GreetingStepConfig = GreetingStepConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ type: MessageConfig }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MessageConfig),
    __metadata("design:type", MessageConfig)
], GreetingStepConfig.prototype, "message", void 0);
class DialStepConfig {
    destination;
    isExtension;
    timeout;
    callerId;
    record;
}
exports.DialStepConfig = DialStepConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number or extension to dial' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DialStepConfig.prototype, "destination", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is this an extension (true) or phone number (false)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DialStepConfig.prototype, "isExtension", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timeout in seconds', default: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], DialStepConfig.prototype, "timeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Caller ID to display' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DialStepConfig.prototype, "callerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Record this leg of the call' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DialStepConfig.prototype, "record", void 0);
class SimulcallStepConfig {
    destinations;
    timeout;
    callerId;
}
exports.SimulcallStepConfig = SimulcallStepConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of destinations to ring simultaneously', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(2),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SimulcallStepConfig.prototype, "destinations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timeout in seconds', default: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], SimulcallStepConfig.prototype, "timeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Caller ID to display' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimulcallStepConfig.prototype, "callerId", void 0);
class RoundRobinStepConfig {
    destinations;
    timeoutPerDestination;
    callerId;
}
exports.RoundRobinStepConfig = RoundRobinStepConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of destinations to try in order', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(2),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RoundRobinStepConfig.prototype, "destinations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timeout per destination in seconds', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], RoundRobinStepConfig.prototype, "timeoutPerDestination", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Caller ID to display' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoundRobinStepConfig.prototype, "callerId", void 0);
class MenuOption {
    digit;
    label;
    steps;
}
exports.MenuOption = MenuOption;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'DTMF digit (1-9, 0, *, #)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[0-9*#]$/, { message: 'Digit must be 0-9, *, or #' }),
    __metadata("design:type", String)
], MenuOption.prototype, "digit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Label for this option' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MenuOption.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sub-flow steps for this option', type: 'array' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], MenuOption.prototype, "steps", void 0);
class MenuStepConfig {
    message;
    options;
    numDigits;
    timeout;
    retries;
    invalidInputSteps;
}
exports.MenuStepConfig = MenuStepConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ type: MessageConfig, description: 'Message to play (e.g., "Press 1 for sales...")' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MessageConfig),
    __metadata("design:type", MessageConfig)
], MenuStepConfig.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [MenuOption], description: 'Menu options' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MenuOption),
    __metadata("design:type", Array)
], MenuStepConfig.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Max digits to collect', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], MenuStepConfig.prototype, "numDigits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timeout waiting for input in seconds', default: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(30),
    __metadata("design:type", Number)
], MenuStepConfig.prototype, "timeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'How many times to replay menu if no input', default: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], MenuStepConfig.prototype, "retries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Steps to execute if invalid/no input', type: 'array' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], MenuStepConfig.prototype, "invalidInputSteps", void 0);
class ScheduleTimeSlot {
    days;
    startTime;
    endTime;
    allDay;
}
exports.ScheduleTimeSlot = ScheduleTimeSlot;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days: "weekdays", "weekends", "everyday", or array of day numbers [0-6]',
        example: 'weekdays',
    }),
    __metadata("design:type", Object)
], ScheduleTimeSlot.prototype, "days", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start time in HH:MM format (24h)', example: '09:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleTimeSlot.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End time in HH:MM format (24h)', example: '17:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleTimeSlot.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'If true, applies to all day (no time range needed)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ScheduleTimeSlot.prototype, "allDay", void 0);
class ScheduleBranch {
    id;
    name;
    timeSlots;
    steps;
}
exports.ScheduleBranch = ScheduleBranch;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique branch ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleBranch.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Branch name (e.g., "Business Hours", "After Hours")' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleBranch.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ScheduleTimeSlot], description: 'Time slots when this branch is active' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ScheduleBranch.prototype, "timeSlots", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sub-flow steps for this branch', type: 'array' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ScheduleBranch.prototype, "steps", void 0);
class ScheduleStepConfig {
    timezone;
    branches;
    fallbackSteps;
}
exports.ScheduleStepConfig = ScheduleStepConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timezone for schedule', example: 'America/Chicago' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleStepConfig.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ScheduleBranch], description: 'Schedule branches with time conditions' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ScheduleStepConfig.prototype, "branches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fallback steps for "Any other time"', type: 'array' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ScheduleStepConfig.prototype, "fallbackSteps", void 0);
class KeypadEntryStepConfig {
    message;
    variableName;
    maxDigits;
    minDigits;
    finishOnKey;
    timeout;
}
exports.KeypadEntryStepConfig = KeypadEntryStepConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ type: MessageConfig, description: 'Prompt message' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MessageConfig),
    __metadata("design:type", MessageConfig)
], KeypadEntryStepConfig.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Variable name to store input', default: 'keypad_input' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KeypadEntryStepConfig.prototype, "variableName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Max digits to collect', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], KeypadEntryStepConfig.prototype, "maxDigits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Min digits required', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], KeypadEntryStepConfig.prototype, "minDigits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Finish on # key', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], KeypadEntryStepConfig.prototype, "finishOnKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timeout in seconds', default: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(30),
    __metadata("design:type", Number)
], KeypadEntryStepConfig.prototype, "timeout", void 0);
class TagStepConfig {
    tagName;
    tagValue;
}
exports.TagStepConfig = TagStepConfig;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tag name to add to the call' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TagStepConfig.prototype, "tagName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tag value (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TagStepConfig.prototype, "tagValue", void 0);
class VoicemailStepConfig {
    greeting;
    notificationEmail;
    maxLength;
    transcribe;
}
exports.VoicemailStepConfig = VoicemailStepConfig;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: MessageConfig, description: 'Voicemail greeting' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MessageConfig),
    __metadata("design:type", MessageConfig)
], VoicemailStepConfig.prototype, "greeting", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email to send voicemail notification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VoicemailStepConfig.prototype, "notificationEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Max recording length in seconds (default 20 to prevent bot spam)', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], VoicemailStepConfig.prototype, "maxLength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transcribe voicemail', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VoicemailStepConfig.prototype, "transcribe", void 0);
class HangupStepConfig {
    message;
}
exports.HangupStepConfig = HangupStepConfig;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: MessageConfig, description: 'Goodbye message before hanging up' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MessageConfig),
    __metadata("design:type", MessageConfig)
], HangupStepConfig.prototype, "message", void 0);
class CallFlowStep {
    id;
    type;
    label;
    config;
}
exports.CallFlowStep = CallFlowStep;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique step ID within the flow' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CallFlowStep.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CallFlowStepType }),
    (0, class_validator_1.IsEnum)(CallFlowStepType),
    __metadata("design:type", String)
], CallFlowStep.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Step label/name for display' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CallFlowStep.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Step configuration (varies by type)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_transformer_1.Transform)(({ value }) => value, { toClassOnly: true }),
    __metadata("design:type", Object)
], CallFlowStep.prototype, "config", void 0);
class CreateCallFlowDto {
    name;
    description;
    isActive;
    recordInboundCalls;
    steps;
}
exports.CreateCallFlowDto = CreateCallFlowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the call flow', example: 'Main IVR' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCallFlowDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description of the call flow' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCallFlowDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether the flow is active', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCallFlowDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Record all inbound calls using this flow', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCallFlowDto.prototype, "recordInboundCalls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CallFlowStep], description: 'Flow steps' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => CallFlowStep),
    __metadata("design:type", Array)
], CreateCallFlowDto.prototype, "steps", void 0);
class UpdateCallFlowDto {
    name;
    description;
    isActive;
    recordInboundCalls;
    steps;
}
exports.UpdateCallFlowDto = UpdateCallFlowDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Name of the call flow' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCallFlowDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description of the call flow' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCallFlowDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether the flow is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCallFlowDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Record all inbound calls using this flow' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCallFlowDto.prototype, "recordInboundCalls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CallFlowStep], description: 'Flow steps' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => CallFlowStep),
    __metadata("design:type", Array)
], UpdateCallFlowDto.prototype, "steps", void 0);
class AssignCallFlowDto {
    callFlowId;
}
exports.AssignCallFlowDto = AssignCallFlowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Call Flow ID to assign to phone number' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignCallFlowDto.prototype, "callFlowId", void 0);
class CallFlowResponseDto {
    id;
    tenantId;
    name;
    description;
    isActive;
    recordInboundCalls;
    steps;
    createdAt;
    updatedAt;
    phoneNumberCount;
}
exports.CallFlowResponseDto = CallFlowResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CallFlowResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CallFlowResponseDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CallFlowResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], CallFlowResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], CallFlowResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], CallFlowResponseDto.prototype, "recordInboundCalls", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CallFlowStep] }),
    __metadata("design:type", Array)
], CallFlowResponseDto.prototype, "steps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CallFlowResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CallFlowResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of phone numbers using this flow' }),
    __metadata("design:type", Number)
], CallFlowResponseDto.prototype, "phoneNumberCount", void 0);
//# sourceMappingURL=call-flow.dto.js.map