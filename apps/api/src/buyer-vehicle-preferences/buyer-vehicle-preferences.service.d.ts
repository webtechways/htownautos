import { PrismaService } from '@htownautos/prisma';
import { CreateBuyerVehiclePreferenceDto } from './dto/create-buyer-vehicle-preference.dto';
import { UpdateBuyerVehiclePreferenceDto } from './dto/update-buyer-vehicle-preference.dto';
export declare class BuyerVehiclePreferencesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureBuyer;
    list(buyerId: string, tenantId: string): Promise<any[]>;
    create(buyerId: string, tenantId: string, userId: string | null, dto: CreateBuyerVehiclePreferenceDto): Promise<any>;
    update(id: string, buyerId: string, tenantId: string, dto: UpdateBuyerVehiclePreferenceDto): Promise<any>;
    matches(buyerId: string, tenantId: string, inspectableOnly?: boolean, trustedSeller?: boolean): Promise<any[]>;
    remove(id: string, buyerId: string, tenantId: string): Promise<{
        deleted: boolean;
    }>;
    addExclusion(buyerId: string, tenantId: string, lotNumberStr: string, createdById: string | null): Promise<{
        lotNumber: string;
        id: string;
        createdAt: Date;
        tenantId: string | null;
        createdById: string | null;
        buyerId: string;
    }>;
    removeExclusion(buyerId: string, tenantId: string, lotNumberStr: string): Promise<{
        ok: boolean;
    }>;
    resetExclusions(buyerId: string, tenantId: string): Promise<{
        removed: number;
    }>;
    listExclusions(buyerId: string, tenantId: string): Promise<{
        lotNumbers: string[];
    }>;
}
