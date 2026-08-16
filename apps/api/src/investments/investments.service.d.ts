import { PrismaService } from '@htownautos/prisma';
import { Prisma } from '@prisma/client';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto';
export declare class InvestmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private toData;
    create(tenantId: string, dto: CreateInvestmentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        source: string;
        amount: Prisma.Decimal;
        sourceAccount: string | null;
        payBackAmount: Prisma.Decimal | null;
        payBackInterval: string | null;
        settleDeadline: Date | null;
    }>;
    findAll(tenantId: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            notes: string | null;
            source: string;
            amount: Prisma.Decimal;
            sourceAccount: string | null;
            payBackAmount: Prisma.Decimal | null;
            payBackInterval: string | null;
            settleDeadline: Date | null;
        }[];
        count: number;
        totalInvested: number;
        totalPayBack: number;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        source: string;
        amount: Prisma.Decimal;
        sourceAccount: string | null;
        payBackAmount: Prisma.Decimal | null;
        payBackInterval: string | null;
        settleDeadline: Date | null;
    }>;
    update(tenantId: string, id: string, dto: UpdateInvestmentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        source: string;
        amount: Prisma.Decimal;
        sourceAccount: string | null;
        payBackAmount: Prisma.Decimal | null;
        payBackInterval: string | null;
        settleDeadline: Date | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
