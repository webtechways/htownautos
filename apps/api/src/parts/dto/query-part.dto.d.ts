export declare class QueryPartDto {
    search?: string;
    categoryId?: string;
    conditionId?: string;
    statusId?: string;
    yearId?: string;
    makeId?: string;
    modelId?: string;
    trimId?: string;
    isOem?: boolean;
    isAftermarket?: boolean;
    minPrice?: number;
    maxPrice?: number;
    lowStock?: boolean;
    location?: string;
    supplier?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
