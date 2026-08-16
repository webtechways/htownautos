import { ShippoService } from '../shippo.service';
export declare class ShippoRefundsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(page?: string, results?: string): Promise<unknown>;
    create(body: {
        transactionId?: string;
        transaction?: string;
    }): Promise<import("shippo").Refund>;
    get(id: string): Promise<import("shippo").Refund>;
}
