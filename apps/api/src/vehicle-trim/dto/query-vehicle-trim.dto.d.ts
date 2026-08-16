import { PaginationDto } from '@htownautos/common';
export declare class QueryVehicleTrimDto extends PaginationDto {
    modelId?: string;
    makeId?: string;
    year?: number;
    isActive?: boolean;
}
