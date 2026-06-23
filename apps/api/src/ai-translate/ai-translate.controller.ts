import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@htownautos/auth';
import { AiTranslateService } from './ai-translate.service';
import { TranslateDto } from './dto/translate.dto';

@Controller('ai')
export class AiTranslateController {
  constructor(private readonly aiTranslateService: AiTranslateService) {}

  @Post('translate')
  @Public()
  translate(@Body() dto: TranslateDto): Promise<{ text: string }> {
    return this.aiTranslateService.translate(dto);
  }
}
