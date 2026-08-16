import { NomenclatorsService } from './nomenclators.service';
import { CreateNomenclatorDto } from './dto/create-nomenclator.dto';
import { UpdateNomenclatorDto } from './dto/update-nomenclator.dto';
import { QueryNomenclatorDto } from './dto/query-nomenclator.dto';
import { NomenclatorEntity } from './entities/nomenclator.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class NomenclatorsController {
    private readonly nomenclatorsService;
    constructor(nomenclatorsService: NomenclatorsService);
    getAvailableTypes(): {
        types: string[];
    };
    create(type: string, createNomenclatorDto: CreateNomenclatorDto): Promise<NomenclatorEntity>;
    findAll(type: string, query: QueryNomenclatorDto): Promise<PaginatedResponseDto<NomenclatorEntity>>;
    findOne(type: string, id: string): Promise<NomenclatorEntity>;
    findBySlug(type: string, slug: string): Promise<NomenclatorEntity>;
    update(type: string, id: string, updateNomenclatorDto: UpdateNomenclatorDto): Promise<NomenclatorEntity>;
    remove(type: string, id: string): Promise<{
        message: string;
    }>;
}
