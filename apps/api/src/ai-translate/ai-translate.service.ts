import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import OpenAI from 'openai';
import { TranslateDto } from './dto/translate.dto';

const MAX_TEXT_LENGTH = 10_000;

const LANG_LABEL: Record<'en' | 'es', string> = {
  en: 'English',
  es: 'Spanish',
};

@Injectable()
export class AiTranslateService {
  private readonly logger = new Logger(AiTranslateService.name);
  private readonly openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async translate(dto: TranslateDto): Promise<{ text: string }> {
    const { targetLang } = dto;
    let text = dto.text.trim();

    if (!text) {
      throw new BadRequestException('text must not be empty');
    }

    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH);
      this.logger.warn(
        `Input text truncated to ${MAX_TEXT_LENGTH} chars before translation`,
      );
    }

    const langLabel = LANG_LABEL[targetLang];
    const systemPrompt = `Translate the user's text to ${langLabel}. Preserve meaning, numbers, currency, and line breaks. Return ONLY the translated text, no preamble.`;

    this.logger.log(
      `→ OpenAI Translate: ${text.length} chars → ${langLabel}`,
    );
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

      this.logger.log(
        `← OpenAI Translate OK (${duration}ms) tokens=${response.usage?.total_tokens}`,
      );

      if (!translated) {
        throw new InternalServerErrorException(
          'Translation service returned an empty response',
        );
      }

      return { text: translated };
    } catch (error) {
      const duration = Date.now() - start;

      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error(
        `← OpenAI Translate FAILED (${duration}ms): ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        'Translation failed. Please try again.',
      );
    }
  }
}
