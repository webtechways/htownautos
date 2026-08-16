import { ShippoService } from '../shippo.service';
export declare class ShippoBatchesController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    create(body: Record<string, unknown>): Promise<unknown>;
    get(id: string, page?: string, results?: string): Promise<unknown>;
    addShipments(id: string, body: Array<Record<string, unknown>>): Promise<unknown>;
    removeShipments(id: string, body: string[]): Promise<unknown>;
    purchase(id: string): Promise<unknown>;
}
