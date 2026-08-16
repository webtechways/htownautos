import { VehicleService } from './vehicle.service';
export declare class VehiclePublicController {
    private readonly vehicleService;
    constructor(vehicleService: VehicleService);
    findOnePublic(id: string): Promise<{
        id: string;
        vin: string;
        stockNumber: string | null;
        year: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
            year: number;
        };
        make: {
            name: string;
            id: string;
            slug: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            yearId: string;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        };
        model: {
            name: string;
            id: string;
            slug: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            makeId: string;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        };
        trim: {
            name: string;
            id: string;
            slug: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            modelId: string;
            metaValue: import("@prisma/client/runtime/client").JsonValue | null;
        } | null;
        vehicleType: {
            id: string;
            slug: string;
            title: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        bodyType: {
            id: string;
            slug: string;
            title: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        fuelType: {
            id: string;
            slug: string;
            title: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        driveType: {
            id: string;
            slug: string;
            title: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        transmissionType: {
            id: string;
            slug: string;
            title: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        vehicleCondition: {
            id: string;
            slug: string;
            title: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        vehicleStatus: {
            id: string;
            slug: string;
            title: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
        } | null;
        vehicleEngine: {
            id: string;
            slug: string;
            title: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        mileage: number | null;
        mileageUnit: {
            id: string;
            slug: string;
            title: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        exteriorColor: string | null;
        interiorColor: string | null;
        engine: string | null;
        cylinders: number | null;
        doors: number | null;
        passengers: number | null;
        askingPrice: import("@prisma/client-runtime-utils").Decimal | null;
        advertisingPrice: import("@prisma/client-runtime-utils").Decimal | null;
        specialPrice: import("@prisma/client-runtime-utils").Decimal | null;
        specialPriceStartDate: Date | null;
        specialPriceEndDate: Date | null;
        msrp: import("@prisma/client-runtime-utils").Decimal | null;
        description: string | null;
        features: string | null;
        mainImage: {
            url: string;
            id: string;
            filename: string;
            mimeType: string;
        } | null;
        gallery: {
            url: string;
            id: string;
            filename: string;
            mimeType: string;
        }[];
        metas: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            description: string | null;
            entityType: string;
            entityId: string;
            userId: string | null;
            isPublic: boolean;
            key: string;
            value: string;
            valueType: string;
            isSystem: boolean;
            isDeleted: boolean;
        }[];
    }>;
}
