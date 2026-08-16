import { PaginationDto } from '@htownautos/common';
export declare class QueryBuyerDto extends PaginationDto {
    search?: string;
    email?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    state?: string;
    isBusinessBuyer?: boolean;
}
