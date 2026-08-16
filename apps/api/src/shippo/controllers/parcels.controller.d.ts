import { ShippoService } from '../shippo.service';
export declare class ShippoParcelsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(page?: string, results?: string): Promise<unknown>;
    create(body: Record<string, unknown>): Promise<unknown>;
    get(id: string): Promise<import("shippo").Parcel>;
}
