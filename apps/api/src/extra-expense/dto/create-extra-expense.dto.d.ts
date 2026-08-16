export declare class CreateExtraExpenseDto {
    vehicleId: string;
    description: string;
    price: number;
    shippingCost?: number;
    tax?: number;
    receiptIds?: string[];
    paidByUserId?: string;
    metaValue?: Record<string, any>;
}
