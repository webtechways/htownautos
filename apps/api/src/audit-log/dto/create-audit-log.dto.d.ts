export declare class CreateAuditLogDto {
    action: string;
    resource: string;
    vehicleId?: string;
    buyerId?: string;
    dealId?: string;
    level?: string;
    piiAccessed?: boolean;
    details?: Record<string, any>;
}
