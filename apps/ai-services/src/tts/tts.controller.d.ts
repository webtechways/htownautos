import { TtsService } from './tts.service';
import { GenerateTtsDto, TtsResponseDto } from './dto/tts.dto';
export declare class TtsController {
    private readonly ttsService;
    constructor(ttsService: TtsService);
    generateTts(dto: GenerateTtsDto): Promise<TtsResponseDto>;
}
