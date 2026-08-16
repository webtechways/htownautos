import { AdminSeedService } from './admin-seed.service';
export declare class AdminSeedController {
    private readonly service;
    constructor(service: AdminSeedService);
    seedBuyers(tenantId: string, body: {
        count?: number;
        daysBack?: number;
    }): Promise<{
        created: number;
        requested: number;
        tenantId: string;
        marker: string;
        emailDomain: string;
    }>;
    deleteBuyers(tenantId: string): Promise<{
        deleted: number;
    }>;
}
