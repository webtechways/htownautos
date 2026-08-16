import { Prisma } from '@prisma/client';
import { PortalService } from './portal.service';
export interface ReceiptPdfOpts {
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string;
}
export declare class ReceiptPdfService {
    private readonly portalService;
    constructor(portalService: PortalService);
    buildOrderReceiptPdf(order: {
        id: string;
        type: string;
        status: string;
        description: string | null;
        amount: Prisma.Decimal | number | string;
        tenantId: string | null;
        metadata: unknown;
        createdAt: Date;
    }, opts: ReceiptPdfOpts): Promise<Uint8Array>;
}
