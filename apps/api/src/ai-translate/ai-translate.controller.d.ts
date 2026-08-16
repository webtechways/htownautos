import { AiTranslateService } from './ai-translate.service';
import { TranslateDto } from './dto/translate.dto';
export declare class AiTranslateController {
    private readonly aiTranslateService;
    constructor(aiTranslateService: AiTranslateService);
    translate(dto: TranslateDto): Promise<{
        text: string;
    }>;
}
