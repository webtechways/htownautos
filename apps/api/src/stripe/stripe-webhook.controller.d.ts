import type { Request } from 'express';
import { StripeService } from './stripe.service';
export declare class StripeWebhookController {
    private readonly stripeService;
    private readonly logger;
    constructor(stripeService: StripeService);
    handleWebhook(req: Request): Promise<{
        received: boolean;
    }>;
}
