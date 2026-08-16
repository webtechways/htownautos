import { PaginationDto } from '@htownautos/common';
export declare class QueryDealDto extends PaginationDto {
    search?: string;
    buyerId?: string;
    vehicleId?: string;
    dealStatusId?: string;
    financeTypeId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
