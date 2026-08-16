import { ShippoService } from '../shippo.service';
export declare class ShippoRatesAtCheckoutController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    createLiveRates(body: Record<string, unknown>): Promise<unknown>;
    getDefault(): Promise<unknown>;
    setDefault(body: Record<string, unknown>): Promise<unknown>;
    deleteDefault(): Promise<unknown>;
}
