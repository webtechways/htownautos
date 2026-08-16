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
var AiTranslateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiTranslateService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const MAX_TEXT_LENGTH = 10_000;
const LANG_LABEL = {
    en: 'English',
    es: 'Spanish',
};
let AiTranslateService = AiTranslateService_1 = class AiTranslateService {
    logger = new common_1.Logger(AiTranslateService_1.name);
    openai;
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async translate(dto) {
        const { targetLang } = dto;
        let text = dto.text.trim();
        if (!text) {
            throw new common_1.BadRequestException('text must not be empty');
        }
        if (text.length > MAX_TEXT_LENGTH) {
            text = text.substring(0, MAX_TEXT_LENGTH);
            this.logger.warn(`Input text truncated to ${MAX_TEXT_LENGTH} chars before translation`);
        }
        const langLabel = LANG_LABEL[targetLang];
        const systemPrompt = `Translate the user's text to ${langLabel}. Preserve meaning, numbers, currency, and line breaks. Return ONLY the translated text, no preamble.`;
        this.logger.log(`→ OpenAI Translate: ${text.length} chars → ${langLabel}`);
        const start = Date.now();
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text },
                ],
                max_tokens: 4096,
                temperature: 0.2,
            });
            const duration = Date.now() - start;
            const translated = response.choices[0]?.message?.content?.trim();
            this.logger.log(`← OpenAI Translate OK (${duration}ms) tokens=${response.usage?.total_tokens}`);
            if (!translated) {
                throw new common_1.InternalServerErrorException('Translation service returned an empty response');
            }
            return { text: translated };
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`← OpenAI Translate FAILED (${duration}ms): ${error instanceof Error ? error.message : String(error)}`);
            throw new common_1.InternalServerErrorException('Translation failed. Please try again.');
        }
    }
};
exports.AiTranslateService = AiTranslateService;
exports.AiTranslateService = AiTranslateService = AiTranslateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiTranslateService);
//# sourceMappingURL=ai-translate.service.js.map