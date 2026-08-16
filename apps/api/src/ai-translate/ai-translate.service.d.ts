import { TranslateDto } from './dto/translate.dto';
export declare class AiTranslateService {
    private readonly logger;
    private readonly openai;
    constructor();
    translate(dto: TranslateDto): Promise<{
        text: string;
    }>;
}
