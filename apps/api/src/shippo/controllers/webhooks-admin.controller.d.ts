import { ShippoService } from '../shippo.service';
export declare class ShippoWebhooksAdminController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(): Promise<unknown>;
    create(body: {
        url: string;
        eventType: string;
        isActive?: boolean;
    }): Promise<unknown>;
    get(id: string): Promise<unknown>;
    update(id: string, body: Record<string, unknown>): Promise<unknown>;
    remove(id: string): Promise<unknown>;
}
