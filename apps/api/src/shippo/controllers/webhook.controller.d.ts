import type { Request } from 'express';
import { ShippoService } from '../shippo.service';
export declare class ShippoWebhookController {
    private readonly shippo;
    private readonly logger;
    constructor(shippo: ShippoService);
    receive(req: Request): Promise<{
        received: boolean;
        event: string | undefined;
    }>;
}
