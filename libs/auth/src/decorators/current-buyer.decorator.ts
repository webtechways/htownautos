import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { PortalBuyer } from '../guards/customer.guard';

/**
 * Extracts the authenticated portal buyer from the request.
 * Only valid on routes protected by CustomerGuard.
 *
 * @example
 * @Get('me')
 * getMe(@CurrentBuyer() buyer: PortalBuyer) {
 *   return buyer;
 * }
 */
export const CurrentBuyer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PortalBuyer => {
    const request = ctx.switchToHttp().getRequest();
    return request.buyer;
  },
);
