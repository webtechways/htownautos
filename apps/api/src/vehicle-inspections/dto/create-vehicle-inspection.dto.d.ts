import { VehicleInspectionStatus } from '@prisma/client';
export declare class CreateVehicleInspectionDto {
    vin: string;
    lotNumber?: string;
    acknowledgeYardWarning?: boolean;
    yardName?: string;
    yardNumber?: string;
    vehicleId?: string;
    buyerId?: string;
    status?: VehicleInspectionStatus;
    specificRequest?: string;
    dueAt?: string;
    inspectedAt?: string;
    inspectorId?: string;
    overallRating?: number;
    marketPrice?: number;
    notes?: string;
    sharedWithIds?: string[];
}
