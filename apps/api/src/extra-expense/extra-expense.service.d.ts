import { PrismaService } from '@htownautos/prisma';
import { MediaService } from '@htownautos/media';
import { CreateExtraExpenseDto } from './dto/create-extra-expense.dto';
import { UpdateExtraExpenseDto } from './dto/update-extra-expense.dto';
import { QueryExtraExpenseDto } from './dto/query-extra-expense.dto';
import { AnalyzeReceiptsDto, AnalyzeReceiptsResult } from './dto/analyze-receipts.dto';
import { ExtraExpenseEntity } from './entities/extra-expense.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class ExtraExpenseService {
    private readonly prisma;
    private readonly mediaService;
    private readonly logger;
    private readonly expense;
    private readonly vehicle;
    private readonly openai;
    constructor(prisma: PrismaService, mediaService: MediaService);
    create(dto: CreateExtraExpenseDto): Promise<ExtraExpenseEntity>;
    findAll(query: QueryExtraExpenseDto): Promise<PaginatedResponseDto<ExtraExpenseEntity>>;
    findOne(id: string): Promise<ExtraExpenseEntity>;
    update(id: string, dto: UpdateExtraExpenseDto): Promise<ExtraExpenseEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getVehicleTotal(vehicleId: string): Promise<{
        total: number;
    }>;
    analyzeReceipts(dto: AnalyzeReceiptsDto): Promise<AnalyzeReceiptsResult>;
    private ensureVehicleExists;
    private ensureExpenseExists;
}
