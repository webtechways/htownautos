import { ShippoService } from '../shippo.service';
export declare class ShippoPickupsController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    create(body: {
        carrierAccount: string;
        location: Record<string, unknown>;
        transactions: string[];
        requestedStartTime: string;
        requestedEndTime: string;
        isTest?: boolean;
        metadata?: string;
    }): Promise<unknown>;
}
