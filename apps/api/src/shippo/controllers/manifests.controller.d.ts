import { ShippoService } from '../shippo.service';
export declare class ShippoManifestsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(page?: string, results?: string): Promise<unknown>;
    create(body: {
        carrierAccount: string;
        shipmentDate: string;
        transactions: string[];
        addressFrom: Record<string, unknown> | string;
        metadata?: string;
    }): Promise<unknown>;
    get(id: string): Promise<import("shippo").Manifest>;
}
