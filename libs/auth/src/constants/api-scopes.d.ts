export declare const API_SCOPE_ACTIONS: readonly ["read", "write"];
export type ApiScopeAction = (typeof API_SCOPE_ACTIONS)[number];
export interface ApiScopeResource {
    slug: string;
    label: string;
    description: string;
}
export declare const API_SCOPE_RESOURCES: ApiScopeResource[];
export declare const ALL_API_SCOPES: string[];
export declare function hasScope(granted: string[], required: string): boolean;
export declare function validateScopes(scopes: string[]): {
    valid: string[];
    invalid: string[];
};
