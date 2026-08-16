import { VehicleMake } from '@prisma/client';
export declare class VehicleMakeEntity implements VehicleMake {
    id: string;
    yearId: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    metaValue: any;
    constructor(partial: Partial<VehicleMakeEntity>);
}
