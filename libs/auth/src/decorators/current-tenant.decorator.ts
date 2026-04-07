import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the current tenant ID from the request.
 * Reads from request.tenant (set by TenantGuard) which supports both
 * Clerk Organization JWT claims and legacy X-Tenant-Id header.
 *
 * @example
 * @Get('vehicles')
 * getVehicles(@CurrentTenant() tenantId: string) {
 *   return this.vehiclesService.findAll(tenantId);
 * }
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant?.id || request.headers['x-tenant-id'] || null;
  },
);
