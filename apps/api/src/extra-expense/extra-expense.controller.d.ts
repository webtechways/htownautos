import { ExtraExpenseService } from './extra-expense.service';
import { CreateExtraExpenseDto } from './dto/create-extra-expense.dto';
import { UpdateExtraExpenseDto } from './dto/update-extra-expense.dto';
import { QueryExtraExpenseDto } from './dto/query-extra-expense.dto';
import { AnalyzeReceiptsDto, AnalyzeReceiptsResult } from './dto/analyze-receipts.dto';
import { ExtraExpenseEntity } from './entities/extra-expense.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class ExtraExpenseController {
    private readonly service;
    constructor(service: ExtraExpenseService);
    create(dto: CreateExtraExpenseDto): Promise<ExtraExpenseEntity>;
    analyzeReceipts(dto: AnalyzeReceiptsDto): Promise<AnalyzeReceiptsResult>;
    findAll(query: QueryExtraExpenseDto): Promise<PaginatedResponseDto<ExtraExpenseEntity>>;
    getVehicleTotal(vehicleId: string): Promise<{
        total: number;
    }>;
    findOne(id: string): Promise<ExtraExpenseEntity>;
    update(id: string, dto: UpdateExtraExpenseDto): Promise<ExtraExpenseEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
