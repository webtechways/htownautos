import { ShippoService } from '../shippo.service';
export declare class ShippoCarrierParcelTemplatesController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(carrier?: string, include?: 'all' | 'user' | 'enabled'): Promise<unknown>;
    get(token: string): Promise<unknown>;
}
