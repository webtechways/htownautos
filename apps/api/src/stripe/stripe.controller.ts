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
  Inject,
  forwardRef,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { AuditLog } from '@htownautos/common';
import { CurrentTenant } from '@htownautos/auth';
import { CurrentUser } from '@htownautos/auth';
import type { AuthenticatedUser } from '@htownautos/auth';
import { PrismaService } from '@htownautos/prisma';
import { ReceiptPdfService } from '../portal/receipt-pdf.service';
import { DecisionNoteDto } from './dto/decision-note.dto';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ReceiptPdfService))
    private readonly receiptPdfService: ReceiptPdfService,
  ) {}

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

  // ── Order Receipt PDF (staff) ─────────────────────────

  /**
   * GET /stripe/customers/:buyerId/orders/:orderId/receipt.pdf
   * Streams a PDF receipt for any PortalOrder belonging to the buyer.
   * Staff only — tenant-scoped via :tenantId resolved by ClerkJwtGuard.
   */
  @Get('customers/:buyerId/orders/:orderId/receipt.pdf')
  @ApiOperation({ summary: 'Download PDF receipt for a buyer order' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'orderId', description: 'PortalOrder UUID' })
  @AuditLog({ action: 'read', resource: 'portal-order-receipt-pdf', level: 'medium', pii: true })
  async getOrderReceiptPdf(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('orderId') orderId: string,
    @Res() res: Response,
  ) {
    // getBuyer (private) enforces tenant membership — reuse via listPaymentMethods shape.
    // We call listPaymentMethods then swap; simpler: query buyer directly here.
    const buyer = await this.prisma.buyer.findFirst({
      where: { id: buyerId, tenantId },
      select: { id: true, firstName: true, lastName: true, email: true, phoneMain: true },
    });
    if (!buyer) throw new BadRequestException('Buyer not found');

    const order = await this.prisma.portalOrder.findFirst({
      where: { id: orderId, buyerId, tenantId },
    });
    if (!order) throw new BadRequestException('Order not found');

    const receiptNumber = order.id.slice(0, 8).toUpperCase();
    const bytes = await this.receiptPdfService.buildOrderReceiptPdf(order as any, {
      buyerName: `${buyer.firstName} ${buyer.lastName}`.trim(),
      buyerEmail: buyer.email ?? '',
      buyerPhone: buyer.phoneMain ?? undefined,
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recibo-${receiptNumber}.pdf"`,
    });
    res.end(Buffer.from(bytes));
  }

  // ── Deposit Release Requests (staff) ──────────────────

  /**
   * GET /stripe/customers/:buyerId/deposit-release-requests
   * Lists all DepositReleaseRequests for a buyer, newest first.
   */
  @Get('customers/:buyerId/deposit-release-requests')
  @ApiOperation({ summary: 'List deposit release requests for a buyer' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @AuditLog({ action: 'read', resource: 'deposit-release-requests', level: 'medium', pii: false })
  async listDepositReleaseRequests(
    @CurrentTenant() tenantId: string,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ) {
    return this.stripeService.listDepositReleaseRequests(buyerId, tenantId);
  }

  /**
   * POST /stripe/customers/:buyerId/deposit-release-requests/:id/approve
   * Approves a PENDING request: creates ledger debit + best-effort Stripe refund.
   */
  @Post('customers/:buyerId/deposit-release-requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a deposit release request' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'id', description: 'DepositReleaseRequest UUID' })
  @AuditLog({ action: 'update', resource: 'deposit-release-request', level: 'critical', pii: true })
  async approveDepositRelease(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('id') id: string,
    @Body() dto: DecisionNoteDto,
  ) {
    return this.stripeService.approveDepositRelease(buyerId, tenantId, id, user.id, dto.note);
  }

  /**
   * POST /stripe/customers/:buyerId/deposit-release-requests/:id/reject
   * Rejects a PENDING request. No ledger change; no Stripe refund.
   */
  @Post('customers/:buyerId/deposit-release-requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a deposit release request' })
  @ApiParam({ name: 'buyerId', description: 'Buyer UUID' })
  @ApiParam({ name: 'id', description: 'DepositReleaseRequest UUID' })
  @AuditLog({ action: 'update', resource: 'deposit-release-request', level: 'high', pii: false })
  async rejectDepositRelease(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
    @Param('id') id: string,
    @Body() dto: DecisionNoteDto,
  ) {
    return this.stripeService.rejectDepositRelease(buyerId, tenantId, id, user.id, dto.note);
  }
}
