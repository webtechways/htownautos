import { NomenclatorsService } from '../nomenclators.service';
import { CreateNomenclatorDto } from '../dto/create-nomenclator.dto';
import { UpdateNomenclatorDto } from '../dto/update-nomenclator.dto';
import { QueryNomenclatorDto } from '../dto/query-nomenclator.dto';
import { NomenclatorEntity } from '../entities/nomenclator.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class TitleBrandsController {
    private readonly nomenclatorsService;
    constructor(nomenclatorsService: NomenclatorsService);
    create(createDto: CreateNomenclatorDto): Promise<NomenclatorEntity>;
    findAll(query: QueryNomenclatorDto): Promise<PaginatedResponseDto<NomenclatorEntity>>;
    findOne(id: string): Promise<NomenclatorEntity>;
    update(id: string, updateDto: UpdateNomenclatorDto): Promise<NomenclatorEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
