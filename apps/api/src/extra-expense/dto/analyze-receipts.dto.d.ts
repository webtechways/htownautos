export declare class AnalyzeReceiptsDto {
    receiptIds: string[];
}
export interface AnalyzeReceiptsResult {
    description: string;
    items: {
        item: string;
        amount: number;
    }[];
    shippingCost: number;
    tax: number;
    total: number;
}
