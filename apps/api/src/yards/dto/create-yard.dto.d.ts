import { YardSource } from '@prisma/client';
export declare class CreateYardDto {
    source: YardSource;
    yardNumber: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    email?: string;
    contactName?: string;
    physicalInspectionAvailable?: boolean;
    hours?: Record<string, unknown>;
    notes?: string;
    travelFeeCents?: number;
    minCars?: number;
    isActive?: boolean;
}
