import { PaginationDto } from '@htownautos/common';
export declare enum YearFilterOperator {
    EQUAL = "eq",
    GREATER_THAN = "gt",
    LESS_THAN = "lt",
    GREATER_THAN_OR_EQUAL = "gte",
    LESS_THAN_OR_EQUAL = "lte"
}
export declare class QueryVehicleYearDto extends PaginationDto {
    year?: number;
    operator?: YearFilterOperator;
    isActive?: boolean;
}
