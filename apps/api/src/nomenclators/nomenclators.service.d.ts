import { PrismaService } from '@htownautos/prisma';
import { CreateNomenclatorDto } from './dto/create-nomenclator.dto';
import { UpdateNomenclatorDto } from './dto/update-nomenclator.dto';
import { QueryNomenclatorDto } from './dto/query-nomenclator.dto';
import { NomenclatorEntity } from './entities/nomenclator.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class NomenclatorsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getModel;
    create(type: string, createNomenclatorDto: CreateNomenclatorDto): Promise<NomenclatorEntity>;
    findAll(type: string, query: QueryNomenclatorDto): Promise<PaginatedResponseDto<NomenclatorEntity>>;
    findOne(type: string, id: string): Promise<NomenclatorEntity>;
    findBySlug(type: string, slug: string): Promise<NomenclatorEntity>;
    update(type: string, id: string, updateNomenclatorDto: UpdateNomenclatorDto): Promise<NomenclatorEntity>;
    remove(type: string, id: string): Promise<{
        message: string;
    }>;
    getAvailableTypes(): string[];
}
