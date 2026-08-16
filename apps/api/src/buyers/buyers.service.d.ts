import { PrismaService } from '@htownautos/prisma';
import { ClerkService } from '@htownautos/auth';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { QueryBuyerDto } from './dto/query-buyer.dto';
import { BuyerEntity } from './entities/buyer.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class BuyersService {
    private readonly prisma;
    private readonly clerkService;
    private readonly logger;
    private readonly buyer;
    constructor(prisma: PrismaService, clerkService: ClerkService);
    create(dto: CreateBuyerDto, tenantId: string): Promise<BuyerEntity>;
    findAll(query: QueryBuyerDto, tenantId: string): Promise<PaginatedResponseDto<BuyerEntity>>;
    findOne(id: string, tenantId: string): Promise<BuyerEntity>;
    update(id: string, dto: UpdateBuyerDto, tenantId: string): Promise<BuyerEntity>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    removeBulk(ids: string[], tenantId: string): Promise<{
        message: string;
        count: number;
    }>;
    private linkClerkAccount;
    private ensureBuyerExists;
    checkDuplicate(tenantId: string, email?: string, phoneMain?: string): Promise<{
        emailExists: boolean;
        phoneExists: boolean;
    }>;
}
