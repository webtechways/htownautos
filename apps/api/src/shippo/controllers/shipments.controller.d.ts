import { ShippoService } from '../shippo.service';
export declare class ShippoShipmentsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(page?: string, results?: string, objectCreatedGte?: string, objectCreatedLte?: string): Promise<unknown>;
    create(body: Record<string, unknown>): Promise<unknown>;
    get(id: string): Promise<import("shippo").Shipment>;
    rates(id: string, page?: string, results?: string): Promise<import("shippo").RatePaginatedList>;
    ratesByCurrency(id: string, currency: string, page?: string, results?: string): Promise<unknown>;
}
