import { ShippoService } from '../shippo.service';
export declare class ShippoOrdersController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(page?: string, results?: string, orderStatus?: string, shopApp?: string): Promise<unknown>;
    create(body: Record<string, unknown>): Promise<unknown>;
    get(id: string): Promise<import("shippo").Order>;
}
