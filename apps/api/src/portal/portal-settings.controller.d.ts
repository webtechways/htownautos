import { PortalPricingService } from './portal-pricing.service';
import { UpdatePortalPricingDto } from './dto/update-portal-pricing.dto';
export declare class PortalSettingsController {
    private readonly pricingService;
    constructor(pricingService: PortalPricingService);
    getPricing(tenantId: string): Promise<import("./portal-pricing.service").PortalPricing>;
    updatePricing(tenantId: string, dto: UpdatePortalPricingDto): Promise<import("./portal-pricing.service").PortalPricing>;
}
