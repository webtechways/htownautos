import { BuyerVehiclePreferencesService } from './buyer-vehicle-preferences.service';
import { CreateBuyerVehiclePreferenceDto } from './dto/create-buyer-vehicle-preference.dto';
import { UpdateBuyerVehiclePreferenceDto } from './dto/update-buyer-vehicle-preference.dto';
import { CreateBuyerMatchExclusionDto } from './dto/create-buyer-match-exclusion.dto';
export declare class BuyerVehiclePreferencesController {
    private readonly service;
    constructor(service: BuyerVehiclePreferencesService);
    list(tenantId: string, buyerId: string): Promise<any[]>;
    matches(tenantId: string, buyerId: string, inspectableOnly?: string, trustedSeller?: string): Promise<any[]>;
    create(tenantId: string, userId: string, buyerId: string, dto: CreateBuyerVehiclePreferenceDto): Promise<any>;
    update(tenantId: string, buyerId: string, id: string, dto: UpdateBuyerVehiclePreferenceDto): Promise<any>;
    remove(tenantId: string, buyerId: string, id: string): Promise<{
        deleted: boolean;
    }>;
}
export declare class BuyerMatchExclusionsController {
    private readonly service;
    constructor(service: BuyerVehiclePreferencesService);
    list(tenantId: string, buyerId: string): Promise<{
        lotNumbers: string[];
    }>;
    add(tenantId: string, userId: string, buyerId: string, dto: CreateBuyerMatchExclusionDto): Promise<{
        lotNumber: string;
        id: string;
        createdAt: Date;
        tenantId: string | null;
        createdById: string | null;
        buyerId: string;
    }>;
    reset(tenantId: string, buyerId: string): Promise<{
        removed: number;
    }>;
    removeSingle(tenantId: string, buyerId: string, lotNumber: string): Promise<{
        ok: boolean;
    }>;
}
