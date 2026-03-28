import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { AuditLog } from '@htownautos/common';
import { CurrentTenant } from '@htownautos/auth';
import { CurrentUser } from '@htownautos/auth';
import type { AuthenticatedUser } from '@htownautos/auth';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // ── SetupIntent ───────────────────────────────────────

  @Post('customers/:buyerId/setup-intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a SetupIntent for adding a payment method' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @AuditLog({
    action: 'create',
    resource: 'stripe-setup-intent',
    level: 'high',
    pii: true,
  })
  async createSetupIntent(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ) {
    return this.stripeService.createSetupIntent(buyerId, tenantId);
  }

  // ── Payment Methods ───────────────────────────────────

  @Get('customers/:buyerId/payment-methods')
  @ApiOperation({ summary: 'List payment methods for a buyer' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @AuditLog({
    action: 'read',
    resource: 'stripe-payment-methods',
    level: 'medium',
    pii: true,
  })
  async listPaymentMethods(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ) {
    return this.stripeService.listPaymentMethods(buyerId, tenantId);
  }

  @Delete('customers/:buyerId/payment-methods/:pmId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a payment method' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'pmId', description: 'Stripe payment method ID' })
  @AuditLog({
    action: 'delete',
    resource: 'stripe-payment-method',
    level: 'high',
    pii: true,
  })
  async detachPaymentMethod(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('pmId') pmId: string,
  ) {
    return this.stripeService.detachPaymentMethod(buyerId, pmId, tenantId);
  }

  @Post('customers/:buyerId/payment-methods/:pmId/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a payment method as default' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'pmId', description: 'Stripe payment method ID' })
  @AuditLog({
    action: 'update',
    resource: 'stripe-payment-method',
    level: 'high',
    pii: true,
  })
  async setDefaultPaymentMethod(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('pmId') pmId: string,
  ) {
    return this.stripeService.setDefaultPaymentMethod(buyerId, pmId, tenantId);
  }

  // ── Payments ──────────────────────────────────────────

  @Post('customers/:buyerId/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a payment for a buyer' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @AuditLog({
    action: 'create',
    resource: 'stripe-payment',
    level: 'critical',
    pii: true,
  })
  async createPayment(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.stripeService.createPayment(
      buyerId,
      tenantId,
      dto.amount,
      dto.description,
      dto.paymentMethodId,
    );
  }

  @Get('customers/:buyerId/payments')
  @ApiOperation({ summary: 'List payments for a buyer' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'starting_after', required: false, type: String })
  @AuditLog({
    action: 'read',
    resource: 'stripe-payments',
    level: 'medium',
    pii: true,
  })
  async listPayments(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Query('limit') limit?: number,
    @Query('starting_after') startingAfter?: string,
  ) {
    return this.stripeService.listPayments(
      buyerId,
      tenantId,
      limit || 20,
      startingAfter,
    );
  }

  // ── Refunds ──────────────────────────────────────────

  @Post('customers/:buyerId/payments/:piId/refund')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'piId', description: 'Stripe PaymentIntent ID' })
  @AuditLog({
    action: 'create',
    resource: 'stripe-refund',
    level: 'critical',
    pii: true,
  })
  async refundPayment(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('piId') piId: string,
  ) {
    return this.stripeService.refundPayment(buyerId, piId, tenantId);
  }

  @Post('customers/:buyerId/refunds/:refundId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending refund' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'refundId', description: 'Stripe Refund ID' })
  @AuditLog({
    action: 'update',
    resource: 'stripe-refund',
    level: 'critical',
    pii: true,
  })
  async cancelRefund(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('refundId') refundId: string,
  ) {
    return this.stripeService.cancelRefund(buyerId, refundId, tenantId);
  }

  // ── Payment Links ────────────────────────────────────

  @Post('customers/:buyerId/payment-link')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create and send a Stripe payment link via SMS or email' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @AuditLog({
    action: 'create',
    resource: 'stripe-payment-link',
    level: 'critical',
    pii: true,
  })
  async createPaymentLink(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Body() dto: CreatePaymentLinkDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const tenantUser = user.tenants?.find(
      (t) => t.tenantId === tenantId || t.tenant?.id === tenantId,
    );
    if (!tenantUser) {
      throw new BadRequestException('User is not a member of this tenant');
    }
    return this.stripeService.createPaymentLink(
      buyerId,
      tenantId,
      dto.amount,
      dto.description,
      dto.note,
      dto.deliveryMethod,
      tenantUser.id,
    );
  }

  // ── Summary ───────────────────────────────────────────

  @Get('customers/:buyerId/summary')
  @ApiOperation({ summary: 'Get payment summary for a buyer' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @AuditLog({
    action: 'read',
    resource: 'stripe-summary',
    level: 'medium',
    pii: false,
  })
  async getPaymentSummary(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ) {
    return this.stripeService.getPaymentSummary(buyerId, tenantId);
  }
}
