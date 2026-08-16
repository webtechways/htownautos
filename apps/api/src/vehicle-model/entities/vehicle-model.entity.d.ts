import { VehicleModel } from '@prisma/client';
export declare class VehicleModelEntity implements VehicleModel {
    id: string;
    makeId: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    metaValue: any;
    constructor(partial: Partial<VehicleModelEntity>);
}
