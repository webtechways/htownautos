import { VehicleTrim } from '@prisma/client';
export declare class VehicleTrimEntity implements VehicleTrim {
    id: string;
    modelId: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    metaValue: any;
    constructor(partial: Partial<VehicleTrimEntity>);
}
