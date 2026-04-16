import { SetMetadata } from '@nestjs/common';

export const API_SCOPES_KEY = 'apiScopes';

/**
 * Declares the scopes an API key must have to call the endpoint.
 * When the request is authenticated via Clerk JWT, this decorator is a no-op
 * (role/permission guards apply instead).
 *
 * @example
 *   @RequireApiScopes('orders:read')
 *   @Get()
 *   list() { ... }
 */
export const RequireApiScopes = (...scopes: string[]) =>
  SetMetadata(API_SCOPES_KEY, scopes);
