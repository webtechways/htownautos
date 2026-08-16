import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto';
export declare class InvestmentsController {
    private readonly service;
    constructor(service: InvestmentsService);
    create(tenantId: string, dto: CreateInvestmentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        notes: string | null;
        source: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        sourceAccount: string | null;
        payBackAmount: import("@prisma/client-runtime-utils").Decimal | null;
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
            amount: import("@prisma/client-runtime-utils").Decimal;
            sourceAccount: string | null;
            payBackAmount: import("@prisma/client-runtime-utils").Decimal | null;
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
        amount: import("@prisma/client-runtime-utils").Decimal;
        sourceAccount: string | null;
        payBackAmount: import("@prisma/client-runtime-utils").Decimal | null;
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
        amount: import("@prisma/client-runtime-utils").Decimal;
        sourceAccount: string | null;
        payBackAmount: import("@prisma/client-runtime-utils").Decimal | null;
        payBackInterval: string | null;
        settleDeadline: Date | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
