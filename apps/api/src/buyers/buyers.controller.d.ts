import { BuyersService } from './buyers.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { QueryBuyerDto } from './dto/query-buyer.dto';
import { BuyerEntity } from './entities/buyer.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class BuyersController {
    private readonly service;
    constructor(service: BuyersService);
    create(tenantId: string, dto: CreateBuyerDto): Promise<BuyerEntity>;
    checkDuplicate(tenantId: string, email?: string, phoneMain?: string): Promise<{
        emailExists: boolean;
        phoneExists: boolean;
    }>;
    findAll(tenantId: string, query: QueryBuyerDto): Promise<PaginatedResponseDto<BuyerEntity>>;
    findOne(tenantId: string, id: string): Promise<BuyerEntity>;
    update(tenantId: string, id: string, dto: UpdateBuyerDto): Promise<BuyerEntity>;
    removeBulk(tenantId: string, body: {
        ids: string[];
    }): Promise<{
        message: string;
        count: number;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
