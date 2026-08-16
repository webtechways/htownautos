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
var TtsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const openai_1 = __importDefault(require("openai"));
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
let TtsService = TtsService_1 = class TtsService {
    prisma;
    s3Service;
    logger = new common_1.Logger(TtsService_1.name);
    openai;
    constructor(prisma, s3Service) {
        this.prisma = prisma;
        this.s3Service = s3Service;
        const apiKey = process.env.TTS_API_KEY;
        if (!apiKey) {
            this.logger.warn('TTS_API_KEY not configured - TTS will not work');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    hashText(text) {
        return (0, crypto_1.createHash)('sha256').update(text).digest('hex');
    }
    async generateTts(text, voice) {
        const textHash = this.hashText(text);
        const cached = await this.prisma.ttsCache.findUnique({
            where: {
                textHash_voice: { textHash, voice },
            },
        });
        if (cached) {
            this.logger.log(`TTS cache hit for voice=${voice}, hash=${textHash.slice(0, 8)}...`);
            return {
                audioUrl: cached.audioUrl,
                cached: true,
            };
        }
        this.logger.log(`TTS cache miss - generating audio for voice=${voice}, hash=${textHash.slice(0, 8)}...`);
        try {
            const response = await this.openai.audio.speech.create({
                model: 'gpt-4o-mini-tts',
                voice: voice,
                input: text,
                response_format: 'mp3',
                speed: 1.25,
            });
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResult = await this.s3Service.uploadBuffer(buffer, 'tts-audio', 'mp3', 'audio/mpeg');
            await this.prisma.ttsCache.create({
                data: {
                    textHash,
                    voice,
                    text: text.slice(0, 500),
                    audioUrl: uploadResult.url,
                    s3Key: uploadResult.key,
                },
            });
            this.logger.log(`TTS audio generated and cached: ${uploadResult.url}`);
            return {
                audioUrl: uploadResult.url,
                cached: false,
            };
        }
        catch (error) {
            this.logger.error('Failed to generate TTS audio', error);
            throw new common_1.InternalServerErrorException('Failed to generate TTS audio');
        }
    }
};
exports.TtsService = TtsService;
exports.TtsService = TtsService = TtsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        common_2.S3Service])
], TtsService);
//# sourceMappingURL=tts.service.js.map