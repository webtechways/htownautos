export declare class CreateApiKeyDto {
    name: string;
    description?: string;
    scopes: string[];
    expiresAt?: string;
}
export declare class UpdateApiKeyDto {
    name?: string;
    description?: string;
    scopes?: string[];
    expiresAt?: string | null;
}
