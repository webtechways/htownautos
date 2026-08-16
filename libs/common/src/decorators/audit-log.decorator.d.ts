export declare const AUDIT_LOG_KEY = "auditLog";
export interface AuditLogMetadata {
    action: string;
    resource: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    pii: boolean;
    compliance?: string[];
    trackChanges?: boolean;
}
export declare const AuditLog: (metadata: AuditLogMetadata) => import("@nestjs/common").CustomDecorator<string>;
