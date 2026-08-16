import { RebuildService } from './rebuild.service';
declare class CreateRebuildItemDto {
    vehicleId: string;
    side: string;
    damageDescription?: string;
}
declare class UpdateRebuildItemDto {
    side?: string;
    damageDescription?: string;
    photosBefore?: any;
    photosAfter?: any;
    sortOrder?: number;
}
export declare class RebuildController {
    private readonly service;
    constructor(service: RebuildService);
    findByVehicle(vehicleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        vehicleId: string;
        side: string;
        damageDescription: string | null;
        photosBefore: import("@prisma/client/runtime/client").JsonValue | null;
        photosAfter: import("@prisma/client/runtime/client").JsonValue | null;
        sortOrder: number;
    }[]>;
    create(tenantId: string, dto: CreateRebuildItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        vehicleId: string;
        side: string;
        damageDescription: string | null;
        photosBefore: import("@prisma/client/runtime/client").JsonValue | null;
        photosAfter: import("@prisma/client/runtime/client").JsonValue | null;
        sortOrder: number;
    }>;
    update(id: string, dto: UpdateRebuildItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        vehicleId: string;
        side: string;
        damageDescription: string | null;
        photosBefore: import("@prisma/client/runtime/client").JsonValue | null;
        photosAfter: import("@prisma/client/runtime/client").JsonValue | null;
        sortOrder: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
export {};
