/**
 * API Key scope registry.
 *
 * Scopes follow the shape `<resource>:<action>` where action is `read` or `write`.
 * `write` implies `read` (enforced in the ApiKeyGuard check).
 */

export const API_SCOPE_ACTIONS = ['read', 'write'] as const;
export type ApiScopeAction = (typeof API_SCOPE_ACTIONS)[number];

export interface ApiScopeResource {
  slug: string;
  label: string;
  description: string;
}

export const API_SCOPE_RESOURCES: ApiScopeResource[] = [
  { slug: 'orders', label: 'Part Orders', description: 'Customer orders for parts (list, read, create, charge, ship)' },
  { slug: 'parts', label: 'Parts', description: 'Parts catalog and inventory' },
  { slug: 'vehicles', label: 'Vehicles', description: 'Vehicle inventory' },
  { slug: 'deals', label: 'Deals', description: 'Sales deals' },
  { slug: 'buyers', label: 'Buyers / Customers', description: 'Customer records' },
  { slug: 'leads', label: 'Leads', description: 'Sales leads and lead sources' },
  { slug: 'inventory-assets', label: 'Inventory Assets', description: 'Media and assets attached to inventory' },
  { slug: 'shippo', label: 'Shipping (Shippo)', description: 'Addresses, rates, labels, tracking, pickups' },
  { slug: 'parcel-templates', label: 'Parcel Templates', description: 'Packaging templates' },
  { slug: 'tasks', label: 'Tasks', description: 'Tasks / to-dos' },
  { slug: 'notes', label: 'Notes', description: 'Free-form notes on entities' },
  { slug: 'phone-calls', label: 'Phone Calls', description: 'Call history and dispositions' },
  { slug: 'sms', label: 'SMS', description: 'SMS messages' },
  { slug: 'email-messages', label: 'Email Messages', description: 'Email thread history' },
  { slug: 'social-accounts', label: 'Social Accounts', description: 'Connected social media accounts' },
  { slug: 'tenant', label: 'Tenant / Business', description: 'Tenant configuration (read-only recommended)' },
];

/** Flat list of every valid scope string. */
export const ALL_API_SCOPES: string[] = API_SCOPE_RESOURCES.flatMap((r) =>
  API_SCOPE_ACTIONS.map((a) => `${r.slug}:${a}`),
);

/**
 * Returns true if the key's granted scopes satisfy `required`.
 * Rule: `<resource>:write` implies `<resource>:read`.
 */
export function hasScope(granted: string[], required: string): boolean {
  if (granted.includes(required)) return true;
  const [resource, action] = required.split(':');
  if (action === 'read' && granted.includes(`${resource}:write`)) return true;
  return false;
}

export function validateScopes(scopes: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const s of scopes) {
    if (ALL_API_SCOPES.includes(s)) valid.push(s);
    else invalid.push(s);
  }
  return { valid, invalid };
}
