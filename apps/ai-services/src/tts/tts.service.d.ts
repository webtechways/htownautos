import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { TtsVoice, TtsResponseDto } from './dto/tts.dto';
export declare class TtsService {
    private readonly prisma;
    private readonly s3Service;
    private readonly logger;
    private readonly openai;
    constructor(prisma: PrismaService, s3Service: S3Service);
    private hashText;
    generateTts(text: string, voice: TtsVoice): Promise<TtsResponseDto>;
}
