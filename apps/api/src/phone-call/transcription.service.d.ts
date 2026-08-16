import { PrismaService } from '@htownautos/prisma';
export declare class TranscriptionService {
    private readonly prisma;
    private readonly logger;
    private readonly openai;
    constructor(prisma: PrismaService);
    transcribeRecording(audioUrl: string, twilioCallSid: string): Promise<string | null>;
    private processTranscriptionWithSpeakers;
    retryTranscription(callId: string): Promise<string | null>;
    transcribeSegmentRecording(audioUrl: string, callId: string): Promise<string | null>;
}
