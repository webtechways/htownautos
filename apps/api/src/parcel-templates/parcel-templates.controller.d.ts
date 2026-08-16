import { ParcelTemplatesService } from './parcel-templates.service';
import { CreateParcelTemplateDto, UpdateParcelTemplateDto } from './dto/parcel-template.dto';
export declare class ParcelTemplatesController {
    private readonly service;
    constructor(service: ParcelTemplatesService);
    findAll(tenantId: string): Promise<{
        custom: {
            length: import("@prisma/client-runtime-utils").Decimal;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            width: import("@prisma/client-runtime-utils").Decimal;
            height: import("@prisma/client-runtime-utils").Decimal;
            carrier: string | null;
            shippoTemplateToken: string | null;
            distanceUnit: string;
            defaultWeight: import("@prisma/client-runtime-utils").Decimal | null;
            massUnit: string;
            isDefault: boolean;
        }[];
        carrier: {
            carrier: string;
            token: string;
            name: string;
            length: number;
            width: number;
            height: number;
            distance_unit: string;
        }[];
    }>;
    recommend(tenantId: string, length: string, width: string, height: string, weight: string): Promise<{
        recommended: null;
        reason: string;
        itemDimensions: number[];
        alternatives?: undefined;
    } | {
        recommended: {
            name: string;
            length: number;
            width: number;
            height: number;
            source: string;
            carrier?: string;
            id?: string;
            token?: string;
        };
        alternatives: {
            name: string;
            length: number;
            width: number;
            height: number;
            source: string;
            carrier?: string;
            id?: string;
            token?: string;
        }[];
        reason?: undefined;
        itemDimensions?: undefined;
    }>;
    findOne(tenantId: string, id: string): Promise<{
        length: import("@prisma/client-runtime-utils").Decimal;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        width: import("@prisma/client-runtime-utils").Decimal;
        height: import("@prisma/client-runtime-utils").Decimal;
        carrier: string | null;
        shippoTemplateToken: string | null;
        distanceUnit: string;
        defaultWeight: import("@prisma/client-runtime-utils").Decimal | null;
        massUnit: string;
        isDefault: boolean;
    }>;
    create(tenantId: string, dto: CreateParcelTemplateDto): Promise<{
        length: import("@prisma/client-runtime-utils").Decimal;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        width: import("@prisma/client-runtime-utils").Decimal;
        height: import("@prisma/client-runtime-utils").Decimal;
        carrier: string | null;
        shippoTemplateToken: string | null;
        distanceUnit: string;
        defaultWeight: import("@prisma/client-runtime-utils").Decimal | null;
        massUnit: string;
        isDefault: boolean;
    }>;
    update(tenantId: string, id: string, dto: UpdateParcelTemplateDto): Promise<{
        length: import("@prisma/client-runtime-utils").Decimal;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        width: import("@prisma/client-runtime-utils").Decimal;
        height: import("@prisma/client-runtime-utils").Decimal;
        carrier: string | null;
        shippoTemplateToken: string | null;
        distanceUnit: string;
        defaultWeight: import("@prisma/client-runtime-utils").Decimal | null;
        massUnit: string;
        isDefault: boolean;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
