export declare enum CallDirection {
    INBOUND = "inbound",
    OUTBOUND = "outbound"
}
export declare enum CallStatus {
    COMPLETED = "completed",
    MISSED = "missed",
    NO_ANSWER = "no_answer",
    BUSY = "busy",
    VOICEMAIL = "voicemail",
    CANCELLED = "cancelled",
    TRANSFERRED = "transferred"
}
export declare enum CallOutcome {
    INTERESTED = "interested",
    NOT_INTERESTED = "not_interested",
    CALLBACK_REQUESTED = "callback_requested",
    WRONG_NUMBER = "wrong_number",
    LEFT_VOICEMAIL = "left_voicemail",
    APPOINTMENT_SET = "appointment_set",
    FOLLOW_UP_NEEDED = "follow_up_needed",
    DO_NOT_CALL = "do_not_call",
    OTHER = "other"
}
export declare enum TranscriptionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum AiSentiment {
    POSITIVE = "positive",
    NEUTRAL = "neutral",
    NEGATIVE = "negative"
}
export declare class CreatePhoneCallDto {
    buyerId: string;
    direction: CallDirection;
    status?: CallStatus;
    fromNumber: string;
    toNumber: string;
    startedAt: string;
    endedAt?: string;
    duration?: number;
    outcome?: CallOutcome;
    notes?: string;
    recordingUrl?: string;
    transcription?: string;
    transcriptionStatus?: TranscriptionStatus;
    aiSummary?: string;
    aiSentiment?: AiSentiment;
    aiKeyPoints?: string[];
    aiNextSteps?: string[];
}
declare const UpdatePhoneCallDto_base: import("@nestjs/common").Type<Partial<CreatePhoneCallDto>>;
export declare class UpdatePhoneCallDto extends UpdatePhoneCallDto_base {
}
export {};
