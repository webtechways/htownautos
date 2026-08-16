import { ExtraExpense, Media } from '@prisma/client';
export declare class ExtraExpenseEntity implements Omit<ExtraExpense, 'price' | 'shippingCost' | 'tax'> {
    id: string;
    vehicleId: string;
    description: string;
    price: number;
    shippingCost: number;
    tax: number;
    receipts?: Media[];
    createdAt: Date;
    updatedAt: Date;
    metaValue: any;
    tenantId: string | null;
    paidByUserId: string | null;
    paidByUser?: any;
    constructor(partial: Partial<ExtraExpenseEntity> & {
        price?: any;
        shippingCost?: any;
        tax?: any;
    });
}
