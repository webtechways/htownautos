import { VehicleInspectionStatus } from '@prisma/client';
export declare class ListVehicleInspectionsDto {
    buyerId?: string;
    vehicleId?: string;
    status?: VehicleInspectionStatus;
    vin?: string;
    lotNumber?: string;
    page?: number;
    limit?: number;
}
