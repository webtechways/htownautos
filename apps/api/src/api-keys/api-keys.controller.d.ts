import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
export declare class ApiKeysController {
    private readonly service;
    constructor(service: ApiKeysService);
    catalog(): {
        resources: import("@htownautos/auth").ApiScopeResource[];
        actions: readonly ["read", "write"];
    };
    list(tenantId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        prefix: string;
        scopes: string[];
        createdById: string | null;
        lastUsedAt: Date | null;
        lastUsedIp: string | null;
        expiresAt: Date | null;
        revokedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }[]>;
    create(tenantId: string, user: any, dto: CreateApiKeyDto): Promise<{
        id: string;
        name: string;
        prefix: string;
        scopes: string[];
        expiresAt: Date | null;
        createdAt: Date;
        token: string;
    }>;
    update(tenantId: string, id: string, dto: UpdateApiKeyDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        createdById: string | null;
        expiresAt: Date | null;
        scopes: string[];
        prefix: string;
        hashedKey: string;
        lastUsedAt: Date | null;
        lastUsedIp: string | null;
        revokedAt: Date | null;
    }>;
    revoke(tenantId: string, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        createdById: string | null;
        expiresAt: Date | null;
        scopes: string[];
        prefix: string;
        hashedKey: string;
        lastUsedAt: Date | null;
        lastUsedIp: string | null;
        revokedAt: Date | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        message: string;
    }>;
}
