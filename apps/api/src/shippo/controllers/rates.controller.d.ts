import { ShippoService } from '../shippo.service';
export declare class ShippoRatesController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    get(id: string): Promise<import("shippo").Rate>;
}
