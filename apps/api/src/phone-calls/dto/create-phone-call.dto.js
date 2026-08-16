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
exports.UpdatePhoneCallDto = exports.CreatePhoneCallDto = exports.AiSentiment = exports.TranscriptionStatus = exports.CallOutcome = exports.CallStatus = exports.CallDirection = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var CallDirection;
(function (CallDirection) {
    CallDirection["INBOUND"] = "inbound";
    CallDirection["OUTBOUND"] = "outbound";
})(CallDirection || (exports.CallDirection = CallDirection = {}));
var CallStatus;
(function (CallStatus) {
    CallStatus["COMPLETED"] = "completed";
    CallStatus["MISSED"] = "missed";
    CallStatus["NO_ANSWER"] = "no_answer";
    CallStatus["BUSY"] = "busy";
    CallStatus["VOICEMAIL"] = "voicemail";
    CallStatus["CANCELLED"] = "cancelled";
    CallStatus["TRANSFERRED"] = "transferred";
})(CallStatus || (exports.CallStatus = CallStatus = {}));
var CallOutcome;
(function (CallOutcome) {
    CallOutcome["INTERESTED"] = "interested";
    CallOutcome["NOT_INTERESTED"] = "not_interested";
    CallOutcome["CALLBACK_REQUESTED"] = "callback_requested";
    CallOutcome["WRONG_NUMBER"] = "wrong_number";
    CallOutcome["LEFT_VOICEMAIL"] = "left_voicemail";
    CallOutcome["APPOINTMENT_SET"] = "appointment_set";
    CallOutcome["FOLLOW_UP_NEEDED"] = "follow_up_needed";
    CallOutcome["DO_NOT_CALL"] = "do_not_call";
    CallOutcome["OTHER"] = "other";
})(CallOutcome || (exports.CallOutcome = CallOutcome = {}));
var TranscriptionStatus;
(function (TranscriptionStatus) {
    TranscriptionStatus["PENDING"] = "pending";
    TranscriptionStatus["COMPLETED"] = "completed";
    TranscriptionStatus["FAILED"] = "failed";
})(TranscriptionStatus || (exports.TranscriptionStatus = TranscriptionStatus = {}));
var AiSentiment;
(function (AiSentiment) {
    AiSentiment["POSITIVE"] = "positive";
    AiSentiment["NEUTRAL"] = "neutral";
    AiSentiment["NEGATIVE"] = "negative";
})(AiSentiment || (exports.AiSentiment = AiSentiment = {}));
class CreatePhoneCallDto {
    buyerId;
    direction;
    status;
    fromNumber;
    toNumber;
    startedAt;
    endedAt;
    duration;
    outcome;
    notes;
    recordingUrl;
    transcription;
    transcriptionStatus;
    aiSummary;
    aiSentiment;
    aiKeyPoints;
    aiNextSteps;
}
exports.CreatePhoneCallDto = CreatePhoneCallDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buyer ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CallDirection, description: 'Call direction' }),
    (0, class_validator_1.IsEnum)(CallDirection),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: CallStatus, description: 'Call status', default: CallStatus.COMPLETED }),
    (0, class_validator_1.IsEnum)(CallStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number that initiated the call' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "fromNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number that received the call' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "toNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Call start time' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Call end time' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "endedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Call duration in seconds' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePhoneCallDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: CallOutcome, description: 'Call outcome' }),
    (0, class_validator_1.IsEnum)(CallOutcome),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "outcome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Call notes/summary' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL to call recording' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "recordingUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full transcription text' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "transcription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TranscriptionStatus, description: 'Transcription status' }),
    (0, class_validator_1.IsEnum)(TranscriptionStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "transcriptionStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AI-generated summary of the call' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "aiSummary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: AiSentiment, description: 'AI-detected sentiment' }),
    (0, class_validator_1.IsEnum)(AiSentiment),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePhoneCallDto.prototype, "aiSentiment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AI-extracted key points', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePhoneCallDto.prototype, "aiKeyPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AI-suggested next steps', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePhoneCallDto.prototype, "aiNextSteps", void 0);
class UpdatePhoneCallDto extends (0, swagger_1.PartialType)(CreatePhoneCallDto) {
}
exports.UpdatePhoneCallDto = UpdatePhoneCallDto;
//# sourceMappingURL=create-phone-call.dto.js.map