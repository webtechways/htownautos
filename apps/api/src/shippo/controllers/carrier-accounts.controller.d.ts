import { ShippoService } from '../shippo.service';
export declare class ShippoCarrierAccountsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(carrier?: string, page?: string, results?: string): Promise<unknown>;
    create(body: Record<string, unknown>): Promise<unknown>;
    register(body: Record<string, unknown>): Promise<unknown>;
    registrationStatus(carrier: string): Promise<unknown>;
    get(id: string): Promise<import("shippo").CarrierAccount>;
    update(id: string, body: Record<string, unknown>): Promise<unknown>;
    oauth2(id: string, body: {
        redirectUri: string;
        state?: string;
    }): Promise<unknown>;
}
