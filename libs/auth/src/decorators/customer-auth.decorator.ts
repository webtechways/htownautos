import { applyDecorators, UseGuards } from '@nestjs/common';
import { CustomerGuard } from '../guards/customer.guard';

/**
 * Composite decorator that applies CustomerGuard to a controller or handler.
 *
 * @example
 * @CustomerAuth()
 * @Controller('portal')
 * export class PortalController {}
 */
export function CustomerAuth() {
  return applyDecorators(UseGuards(CustomerGuard));
}
