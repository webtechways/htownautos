import { YardSource } from '@prisma/client';
export declare class QueryYardsDto {
    page?: number;
    limit?: number;
    search?: string;
    source?: YardSource;
    state?: string;
    physicalInspectionAvailable?: boolean;
    isActive?: boolean;
    yardNumber?: number;
}
