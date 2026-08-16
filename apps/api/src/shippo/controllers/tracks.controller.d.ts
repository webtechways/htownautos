import { ShippoService } from '../shippo.service';
export declare class ShippoTracksController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    register(body: {
        carrier: string;
        trackingNumber: string;
        metadata?: string;
    }): Promise<unknown>;
    get(carrier: string, trackingNumber: string): Promise<import("shippo").Track | null>;
}
