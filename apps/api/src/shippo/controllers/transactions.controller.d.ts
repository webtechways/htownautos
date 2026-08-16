import { ShippoService } from '../shippo.service';
export declare class ShippoTransactionsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(page?: string, results?: string, rate?: string, trackingNumber?: string, objectStatus?: string): Promise<unknown>;
    create(body: {
        rateId?: string;
        rate?: string;
        labelFileType?: any;
    } & Record<string, unknown>): Promise<unknown>;
    get(id: string): Promise<import("shippo").Transaction>;
}
