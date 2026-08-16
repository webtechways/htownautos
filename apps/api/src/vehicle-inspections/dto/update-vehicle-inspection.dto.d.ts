import { VehicleInspectionStatus } from '@prisma/client';
export declare class UpdateVehicleInspectionDto {
    vin?: string;
    lotNumber?: string;
    yardName?: string;
    yardNumber?: string;
    vehicleId?: string;
    buyerId?: string;
    status?: VehicleInspectionStatus;
    specificRequest?: string;
    dueAt?: string;
    inspectedAt?: string;
    completedAt?: string;
    inspectorId?: string;
    overallRating?: number;
    marketPrice?: number;
    notes?: string;
    sharedWithIds?: string[];
}
