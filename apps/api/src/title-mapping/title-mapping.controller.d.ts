import { TitleMappingService } from './title-mapping.service';
import { AssignTitleMappingDto } from './dto/assign-title-mapping.dto';
export declare class TitleMappingController {
    private readonly service;
    constructor(service: TitleMappingService);
    list(): Promise<{
        code: string;
        category: string;
    }[]>;
    assign(dto: AssignTitleMappingDto, userId: string): Promise<{
        code: string;
        category: string;
    }>;
    remove(code: string): Promise<void>;
}
