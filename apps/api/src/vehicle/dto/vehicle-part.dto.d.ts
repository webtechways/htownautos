export declare class CreateVehiclePartDto {
    partId: string;
    quantity?: number;
    priceAtTime?: number;
    notes?: string;
}
export declare class UpdateVehiclePartDto {
    quantity?: number;
    priceAtTime?: number;
    notes?: string;
}
export declare class CreatePartAndAssociateDto {
    name: string;
    partNumber?: string;
    sku?: string;
    description?: string;
    conditionId: string;
    statusId: string;
    categoryId?: string;
    cost?: number;
    price: number;
    quantity: number;
    quantityToUse: number;
    notes?: string;
}
