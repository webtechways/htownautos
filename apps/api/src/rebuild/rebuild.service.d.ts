import { PrismaService } from '@htownautos/prisma';
export declare class RebuildService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    create(vehicleId: string, data: {
        side: string;
        damageDescription?: string;
        tenantId?: string;
    }): Promise<{
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
    update(id: string, data: {
        side?: string;
        damageDescription?: string;
        photosBefore?: any;
        photosAfter?: any;
        sortOrder?: number;
    }): Promise<{
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
