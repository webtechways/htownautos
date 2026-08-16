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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TranscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const prisma_1 = require("@htownautos/prisma");
let TranscriptionService = TranscriptionService_1 = class TranscriptionService {
    prisma;
    logger = new common_1.Logger(TranscriptionService_1.name);
    openai;
    constructor(prisma) {
        this.prisma = prisma;
        const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY not configured - Transcription will not work');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async transcribeRecording(audioUrl, twilioCallSid) {
        this.logger.log(`Starting transcription for call ${twilioCallSid}`);
        await this.prisma.phoneCall.update({
            where: { twilioCallSid },
            data: { transcriptionStatus: 'processing' },
        });
        try {
            const response = await fetch(audioUrl);
            if (!response.ok) {
                throw new Error(`Failed to download audio: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            this.logger.log(`Downloaded audio for transcription: ${buffer.length} bytes`);
            const file = new File([buffer], 'recording.mp3', { type: 'audio/mpeg' });
            const transcriptionResult = await this.openai.audio.transcriptions.create({
                file: file,
                model: 'gpt-4o-transcribe-diarize',
                response_format: 'diarized_json',
                chunking_strategy: 'auto',
            });
            this.logger.log(`Transcription completed for call ${twilioCallSid}`);
            const timelineData = this.processTranscriptionWithSpeakers(transcriptionResult);
            const transcriptionJson = JSON.stringify(timelineData);
            await this.prisma.phoneCall.update({
                where: { twilioCallSid },
                data: {
                    transcription: transcriptionJson,
                    transcriptionStatus: 'completed',
                },
            });
            return transcriptionJson;
        }
        catch (error) {
            this.logger.error(`Transcription failed for call ${twilioCallSid}: ${error.message}`);
            this.logger.error(`Error stack: ${error.stack}`);
            await this.prisma.phoneCall.update({
                where: { twilioCallSid },
                data: { transcriptionStatus: 'failed' },
            });
            return null;
        }
    }
    processTranscriptionWithSpeakers(result) {
        if (result.segments && result.segments.length > 0) {
            const speakerMap = new Map();
            let speakerCount = 0;
            const segments = result.segments.map((seg) => {
                let speakerLabel = seg.speaker || 'unknown';
                if (!speakerMap.has(speakerLabel)) {
                    speakerCount++;
                    speakerMap.set(speakerLabel, `Speaker ${speakerCount}`);
                }
                return {
                    start: seg.start,
                    end: seg.end,
                    text: seg.text.trim(),
                    speaker: speakerMap.get(speakerLabel) || 'Speaker 1',
                };
            });
            const duration = result.duration || (segments.length > 0 ? segments[segments.length - 1].end : 0);
            return {
                text: result.text,
                duration,
                segments,
            };
        }
        return {
            text: result.text || '',
            duration: result.duration || 0,
            segments: [
                {
                    start: 0,
                    end: result.duration || 0,
                    text: result.text || '',
                    speaker: 'Speaker 1',
                },
            ],
        };
    }
    async retryTranscription(callId) {
        const call = await this.prisma.phoneCall.findUnique({
            where: { id: callId },
            select: { recordingUrl: true, twilioCallSid: true },
        });
        if (!call?.recordingUrl || !call?.twilioCallSid) {
            this.logger.warn(`Cannot retry transcription - no recording URL for call ${callId}`);
            return null;
        }
        return this.transcribeRecording(call.recordingUrl, call.twilioCallSid);
    }
    async transcribeSegmentRecording(audioUrl, callId) {
        this.logger.log(`Starting transcription for call segment ${callId}`);
        await this.prisma.phoneCall.update({
            where: { id: callId },
            data: { transcriptionStatus: 'processing' },
        });
        try {
            const response = await fetch(audioUrl);
            if (!response.ok) {
                throw new Error(`Failed to download audio: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            this.logger.log(`Downloaded audio for segment transcription: ${buffer.length} bytes`);
            const file = new File([buffer], 'recording.mp3', { type: 'audio/mpeg' });
            const transcriptionResult = await this.openai.audio.transcriptions.create({
                file: file,
                model: 'gpt-4o-transcribe-diarize',
                response_format: 'diarized_json',
                chunking_strategy: 'auto',
            });
            this.logger.log(`Transcription completed for segment ${callId}`);
            const timelineData = this.processTranscriptionWithSpeakers(transcriptionResult);
            const transcriptionJson = JSON.stringify(timelineData);
            await this.prisma.phoneCall.update({
                where: { id: callId },
                data: {
                    transcription: transcriptionJson,
                    transcriptionStatus: 'completed',
                },
            });
            return transcriptionJson;
        }
        catch (error) {
            this.logger.error(`Transcription failed for segment ${callId}: ${error.message}`);
            await this.prisma.phoneCall.update({
                where: { id: callId },
                data: { transcriptionStatus: 'failed' },
            });
            return null;
        }
    }
};
exports.TranscriptionService = TranscriptionService;
exports.TranscriptionService = TranscriptionService = TranscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], TranscriptionService);
//# sourceMappingURL=transcription.service.js.map