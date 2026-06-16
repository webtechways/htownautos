import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
  Inject,
  forwardRef,
} from '@nestjs/common';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { StripeEventsService } from '../presence/stripe-events.service';
import { SmsService } from '../sms/sms.service';
import { EmailService } from '../email/email.service';
import { ShortUrlService } from '../short-url/short-url.service';
// Value import (NOT `import type`) so PortalService is a usable DI token.
// The module cycle (StripeModule ↔ PortalModule) is broken with forwardRef both
// at the module level and on this injection point. portal.service.ts does not
// import this file, so there is no file-level circular import.
import { PortalService } from '../portal/portal.service';
import type { OrderReceiptDetail } from '../portal/portal.service';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeEvents: StripeEventsService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
    private readonly shortUrlService: ShortUrlService,
    @Optional()
    @Inject(forwardRef(() => PortalService))
    private readonly portalService?: PortalService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  // ── Tenant-safe buyer lookup ──────────────────────────

  private async getBuyer(buyerId: string, tenantId: string) {
    const buyer = await this.prisma.buyer.findFirst({
      where: { id: buyerId, tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneMain: true,
        stripeCustomerId: true,
        tenantId: true,
      },
    });
    if (!buyer) {
      throw new NotFoundException(`Buyer ${buyerId} not found`);
    }
    return buyer;
  }

  // ── Stripe Customer Management ────────────────────────

  async getOrCreateStripeCustomer(
    buyerId: string,
    tenantId: string,
  ): Promise<string> {
    const buyer = await this.getBuyer(buyerId, tenantId);

    if (buyer.stripeCustomerId) {
      return buyer.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: buyer.email || undefined,
      name: `${buyer.firstName} ${buyer.lastName}`.trim(),
      phone: buyer.phoneMain || undefined,
      metadata: {
        buyerId: buyer.id,
        tenantId,
      },
    });

    await this.prisma.buyer.update({
      where: { id: buyerId },
      data: { stripeCustomerId: customer.id },
    });

    this.logger.log(
      `Created Stripe customer ${customer.id} for buyer ${buyerId}`,
    );
    return customer.id;
  }

  // ── SetupIntent (for adding payment methods) ──────────

  async createSetupIntent(buyerId: string, tenantId: string) {
    const stripeCustomerId = await this.getOrCreateStripeCustomer(
      buyerId,
      tenantId,
    );

    const setupIntent = await this.stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      metadata: {
        buyerId,
        tenantId,
      },
    });

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    };
  }

  // ── Payment Methods ───────────────────────────────────

  async listPaymentMethods(buyerId: string, tenantId: string) {
    const buyer = await this.getBuyer(buyerId, tenantId);

    if (!buyer.stripeCustomerId) {
      return { paymentMethods: [], defaultPaymentMethodId: null };
    }

    const [paymentMethods, customer] = await Promise.all([
      this.stripe.paymentMethods.list({
        customer: buyer.stripeCustomerId,
        type: 'card',
      }),
      this.stripe.customers.retrieve(buyer.stripeCustomerId),
    ]);

    const defaultPmId = (customer as Stripe.Customer).invoice_settings
      ?.default_payment_method;

    return {
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: pm.id === defaultPmId,
        created: pm.created,
      })),
      defaultPaymentMethodId: defaultPmId || null,
    };
  }

  async detachPaymentMethod(
    buyerId: string,
    paymentMethodId: string,
    tenantId: string,
  ) {
    const buyer = await this.getBuyer(buyerId, tenantId);

    if (!buyer.stripeCustomerId) {
      throw new BadRequestException('Buyer has no Stripe customer');
    }

    const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== buyer.stripeCustomerId) {
      throw new BadRequestException(
        'Payment method does not belong to this customer',
      );
    }

    await this.stripe.paymentMethods.detach(paymentMethodId);
    return { message: 'Payment method removed' };
  }

  async setDefaultPaymentMethod(
    buyerId: string,
    paymentMethodId: string,
    tenantId: string,
  ) {
    const buyer = await this.getBuyer(buyerId, tenantId);

    if (!buyer.stripeCustomerId) {
      throw new BadRequestException('Buyer has no Stripe customer');
    }

    const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer !== buyer.stripeCustomerId) {
      throw new BadRequestException(
        'Payment method does not belong to this customer',
      );
    }

    await this.stripe.customers.update(buyer.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return { message: 'Default payment method updated' };
  }

  // ── Payments ──────────────────────────────────────────

  async createPayment(
    buyerId: string,
    tenantId: string,
    amountInCents: number,
    description: string,
    paymentMethodId?: string,
  ) {
    const stripeCustomerId = await this.getOrCreateStripeCustomer(
      buyerId,
      tenantId,
    );

    const params: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: 'usd',
      customer: stripeCustomerId,
      description,
      metadata: {
        buyerId,
        tenantId,
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    };

    if (paymentMethodId) {
      params.payment_method = paymentMethodId;
      params.confirm = true;
    }

    const paymentIntent = await this.stripe.paymentIntents.create(params);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async listPayments(
    buyerId: string,
    tenantId: string,
    limit = 20,
    startingAfter?: string,
  ) {
    const buyer = await this.getBuyer(buyerId, tenantId);

    if (!buyer.stripeCustomerId) {
      return { payments: [], hasMore: false };
    }

    const params: Stripe.PaymentIntentListParams = {
      customer: buyer.stripeCustomerId,
      limit,
    };
    if (startingAfter) {
      params.starting_after = startingAfter;
    }

    const paymentIntents = await this.stripe.paymentIntents.list({
      ...params,
      expand: ['data.latest_charge'],
    });

    const events: Array<{
      id: string;
      type: 'payment' | 'refund';
      amount: number;
      currency: string;
      status: string;
      description: string | null;
      created: number;
      paymentMethod: { brand: string; last4: string } | null;
      refunded: boolean;
      refundStatus: string | null;
      refundId: string | null;
      amountRefunded: number;
      relatedPaymentId: string | null;
      orderType: string | null;
      order: OrderReceiptDetail | null;
    }> = [];

    for (const pi of paymentIntents.data) {
      const charge = pi.latest_charge as Stripe.Charge | null;
      const cardDetails = charge?.payment_method_details?.card;
      const paymentMethod = cardDetails
        ? {
            brand: cardDetails.brand || 'unknown',
            last4: cardDetails.last4 || '****',
          }
        : null;
      const latestRefund = charge?.refunds?.data?.[0] ?? null;

      // Payment event
      events.push({
        id: pi.id,
        type: 'payment',
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        description: pi.description,
        created: pi.created,
        paymentMethod,
        refunded: charge?.refunded ?? false,
        refundStatus: latestRefund?.status ?? null,
        refundId: latestRefund?.id ?? null,
        amountRefunded: charge?.amount_refunded ?? 0,
        relatedPaymentId: null,
        orderType: null,
        order: null,
      });

      // Individual refund events
      if (charge?.refunds?.data) {
        for (const refund of charge.refunds.data) {
          events.push({
            id: refund.id,
            type: 'refund',
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status ?? 'unknown',
            description: pi.description
              ? `Refund – ${pi.description}`
              : 'Refund',
            created: refund.created,
            paymentMethod,
            refunded: false,
            refundStatus: null,
            refundId: null,
            amountRefunded: 0,
            relatedPaymentId: pi.id,
            orderType: null,
            order: null,
          });
        }
      }
    }

    // Enrich payment events with the underlying PortalOrder receipt (itemized
    // breakdown + links to the inspections it created). Best-effort: never let
    // a failure here break the payments list.
    try {
      const piIds = events.filter((e) => e.type === 'payment').map((e) => e.id);
      // Map each PaymentIntent id → portalOrderId from its metadata (set at
      // checkout). This is a robust fallback when the order never got its
      // stripePaymentIntentId stamped (e.g. webhook path that didn't fire).
      const piToOrderId = new Map<string, string>();
      for (const pi of paymentIntents.data) {
        const oid = pi.metadata?.portalOrderId;
        if (oid) piToOrderId.set(pi.id, oid);
      }
      const orderIds = Array.from(new Set(piToOrderId.values()));

      if ((piIds.length > 0 || orderIds.length > 0) && this.portalService) {
        const orders = await this.prisma.portalOrder.findMany({
          where: {
            buyerId,
            OR: [
              { stripePaymentIntentId: { in: piIds } },
              ...(orderIds.length > 0 ? [{ id: { in: orderIds } }] : []),
            ],
          },
        });
        const orderByPi = new Map(
          orders
            .filter((o) => o.stripePaymentIntentId)
            .map((o) => [o.stripePaymentIntentId as string, o]),
        );
        const orderById = new Map(orders.map((o) => [o.id, o]));

        await Promise.all(
          events
            .filter((e) => e.type === 'payment')
            .map(async (e) => {
              const order =
                orderByPi.get(e.id) ??
                orderById.get(piToOrderId.get(e.id) ?? '');
              if (!order) return;
              e.orderType = order.type;
              e.order =
                (await this.portalService!.buildOrderReceiptDetail(order as any)) ??
                null;
            }),
        );
      }
    } catch (err) {
      this.logger.warn(
        `listPayments: order enrichment failed for buyer ${buyerId} — ${(err as Error).message}`,
      );
    }

    // Sort by created descending
    events.sort((a, b) => b.created - a.created);

    return {
      events,
      hasMore: paymentIntents.has_more,
      nextCursor:
        paymentIntents.data.length > 0
          ? paymentIntents.data[paymentIntents.data.length - 1].id
          : null,
    };
  }

  // ── Refunds ──────────────────────────────────────────

  async refundPayment(
    buyerId: string,
    paymentIntentId: string,
    tenantId: string,
  ) {
    const buyer = await this.getBuyer(buyerId, tenantId);

    if (!buyer.stripeCustomerId) {
      throw new BadRequestException('Buyer has no Stripe customer');
    }

    // Verify the PaymentIntent belongs to this customer
    const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.customer !== buyer.stripeCustomerId) {
      throw new BadRequestException(
        'Payment does not belong to this customer',
      );
    }

    if (pi.status !== 'succeeded') {
      throw new BadRequestException(
        'Only succeeded payments can be refunded',
      );
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    this.logger.log(
      `Refund ${refund.id} created for PaymentIntent ${paymentIntentId} — $${(refund.amount / 100).toFixed(2)}`,
    );

    return {
      id: refund.id,
      amount: refund.amount,
      status: refund.status,
      paymentIntentId,
    };
  }

  async cancelRefund(
    buyerId: string,
    refundId: string,
    tenantId: string,
  ) {
    const buyer = await this.getBuyer(buyerId, tenantId);

    if (!buyer.stripeCustomerId) {
      throw new BadRequestException('Buyer has no Stripe customer');
    }

    // Retrieve the refund to verify it belongs to this customer
    const refund = await this.stripe.refunds.retrieve(refundId);
    if (refund.payment_intent) {
      const piId =
        typeof refund.payment_intent === 'string'
          ? refund.payment_intent
          : refund.payment_intent.id;
      const pi = await this.stripe.paymentIntents.retrieve(piId);
      if (pi.customer !== buyer.stripeCustomerId) {
        throw new BadRequestException(
          'Refund does not belong to this customer',
        );
      }
    }

    if (refund.status !== 'pending') {
      throw new BadRequestException(
        'Only pending refunds can be canceled',
      );
    }

    const canceled = await this.stripe.refunds.cancel(refundId);

    this.logger.log(`Refund ${refundId} canceled`);

    return {
      id: canceled.id,
      status: canceled.status,
    };
  }

  // ── Summary ───────────────────────────────────────────

  /**
   * Compute the buyer's true deposit figures from the ledger.
   * "Deposit" = money the customer added to their account for future services —
   * NOT one-off inspection/service payments. depositBalanceCents is the spendable
   * account balance; depositTotalCents is the lifetime sum of DEPOSIT entries.
   */
  private async computeBuyerDeposits(
    buyerId: string,
  ): Promise<{ depositTotalCents: number; depositBalanceCents: number }> {
    try {
      const entries = await this.prisma.customerLedgerEntry.findMany({
        where: { buyerId },
        select: { type: true, status: true, amount: true },
      });
      let depositTotalCents = 0;
      let depositBalanceCents = 0;
      for (const e of entries) {
        if (e.status !== 'COMPLETED') continue;
        const cents = Math.round(Number(e.amount) * 100);
        if (e.type === 'DEPOSIT') {
          depositTotalCents += cents;
          depositBalanceCents += cents;
        } else if (e.type === 'REFUND' || e.type === 'ADJUSTMENT') {
          depositBalanceCents += cents;
        } else if (e.type === 'CHARGE' || e.type === 'APPLIED') {
          depositBalanceCents -= cents;
        }
      }
      return {
        depositTotalCents,
        depositBalanceCents: Math.max(0, depositBalanceCents),
      };
    } catch {
      return { depositTotalCents: 0, depositBalanceCents: 0 };
    }
  }

  async getPaymentSummary(buyerId: string, tenantId: string) {
    const buyer = await this.getBuyer(buyerId, tenantId);
    const deposits = await this.computeBuyerDeposits(buyerId);

    if (!buyer.stripeCustomerId) {
      return {
        totalPaid: 0,
        paymentCount: 0,
        lastPaymentDate: null,
        lastPaymentAmount: null,
        defaultPaymentMethod: null,
        hasPaymentMethods: false,
        ...deposits,
      };
    }

    const [paymentIntents, customer, paymentMethods] = await Promise.all([
      this.stripe.paymentIntents.list({
        customer: buyer.stripeCustomerId,
        limit: 100,
        expand: ['data.latest_charge'],
      }),
      this.stripe.customers.retrieve(buyer.stripeCustomerId),
      this.stripe.paymentMethods.list({
        customer: buyer.stripeCustomerId,
        type: 'card',
        limit: 1,
      }),
    ]);

    const succeeded = paymentIntents.data.filter(
      (pi) => pi.status === 'succeeded',
    );
    const totalPaid = succeeded.reduce((sum, pi) => {
      const charge = pi.latest_charge as Stripe.Charge | null;
      const refunded = charge?.amount_refunded ?? 0;
      return sum + pi.amount - refunded;
    }, 0);
    const lastPayment = succeeded[0];

    const cust = customer as Stripe.Customer;
    const defaultPmId = cust.invoice_settings?.default_payment_method;
    let defaultPmSummary: { brand: string; last4: string } | null = null;

    if (defaultPmId && typeof defaultPmId === 'string') {
      const pm = await this.stripe.paymentMethods.retrieve(defaultPmId);
      defaultPmSummary = {
        brand: pm.card?.brand || 'unknown',
        last4: pm.card?.last4 || '****',
      };
    }

    return {
      totalPaid,
      paymentCount: succeeded.length,
      lastPaymentDate: lastPayment ? lastPayment.created : null,
      lastPaymentAmount: lastPayment ? lastPayment.amount : null,
      defaultPaymentMethod: defaultPmSummary,
      hasPaymentMethods: paymentMethods.data.length > 0,
      ...deposits,
    };
  }

  // ── Payment Links (Checkout Sessions) ────────────────

  async createPaymentLink(
    buyerId: string,
    tenantId: string,
    amountInCents: number,
    description: string,
    note: string,
    deliveryMethod: 'sms' | 'email',
    senderId: string,
  ) {
    const buyer = await this.getBuyer(buyerId, tenantId);
    const stripeCustomerId = await this.getOrCreateStripeCustomer(
      buyerId,
      tenantId,
    );

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountInCents,
            product_data: { name: description },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        description,
        metadata: { buyerId, tenantId },
      },
      metadata: { buyerId, tenantId },
      success_url: 'https://app.htownautos.com/payment/status?session_id={CHECKOUT_SESSION_ID}&result=success',
      cancel_url: 'https://app.htownautos.com/payment/status?session_id={CHECKOUT_SESSION_ID}&result=canceled',
    });

    const amountFormatted = `$${(amountInCents / 100).toFixed(2)}`;

    // Shorten the Stripe checkout URL for cleaner SMS/Email
    const { shortUrl } = await this.shortUrlService.create(
      session.url!,
      tenantId,
      senderId,
      new Date(Date.now() + 24 * 60 * 60 * 1000), // expires in 24h
    );
    const linkUrl = shortUrl;

    // Send via SMS or Email
    if (deliveryMethod === 'sms') {
      const phone = buyer.phoneMain;
      if (!phone) {
        throw new BadRequestException('Buyer has no phone number for SMS');
      }
      const body = `${note}\n\nPayment amount: ${amountFormatted}\nPay here: ${linkUrl}`;
      await this.smsService.sendSms(tenantId, senderId, {
        buyerId,
        body,
      });
      this.logger.log(
        `Payment link sent via SMS to buyer ${buyerId} — ${amountFormatted}`,
      );
    } else {
      const email = buyer.email;
      if (!email) {
        throw new BadRequestException('Buyer has no email address');
      }
      await this.emailService.sendEmail({
        to: email,
        subject: `Payment Request — ${amountFormatted}`,
        htmlBody: this.getPaymentLinkHtml(
          `${buyer.firstName} ${buyer.lastName}`.trim(),
          note,
          amountFormatted,
          description,
          linkUrl,
        ),
        textBody: `${note}\n\nAmount: ${amountFormatted}\nDescription: ${description}\nPay here: ${linkUrl}`,
        fromName: 'HTown Autos',
      });
      this.logger.log(
        `Payment link sent via email to buyer ${buyerId} — ${amountFormatted}`,
      );
    }

    return { url: linkUrl, sessionId: session.id };
  }

  private getPaymentLinkHtml(
    customerName: string,
    note: string,
    amount: string,
    description: string,
    linkUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f4f4f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,.1);">
        <tr><td style="padding:40px 40px 20px;text-align:center;border-bottom:1px solid #e4e4e7;">
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#18181b;">HTown Autos</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;">Payment Request</h2>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#52525b;">
            Hi ${customerName},
          </p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#52525b;">${note}</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;background:#f4f4f5;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#71717a;"><strong>Amount:</strong> ${amount}</p>
              <p style="margin:0;font-size:14px;color:#71717a;"><strong>Description:</strong> ${description}</p>
            </td></tr>
          </table>
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr><td align="center" style="padding:20px 0;">
              <a href="${linkUrl}" style="display:inline-block;padding:14px 32px;background:#2563eb;color:#fff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">
                Pay ${amount}
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:14px;color:#a1a1aa;">If the button doesn't work, copy and paste this link:</p>
          <p style="margin:8px 0 0;font-size:12px;color:#2563eb;word-break:break-all;">${linkUrl}</p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #e4e4e7;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">&copy; ${new Date().getFullYear()} HTown Autos. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
  }

  // ── Deposit release requests (staff-facing) ──────────

  /** List all DepositReleaseRequests for a buyer (newest first). */
  async listDepositReleaseRequests(buyerId: string, tenantId: string) {
    await this.getBuyer(buyerId, tenantId); // tenant-scope check
    const rows = await this.prisma.depositReleaseRequest.findMany({
      where: { buyerId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({ ...r, amount: r.amount.toString() }));
  }

  /** Approve a PENDING DepositReleaseRequest: create ledger debit + attempt Stripe refund. */
  async approveDepositRelease(
    buyerId: string,
    tenantId: string,
    id: string,
    staffUserId: string | null,
    note?: string,
  ) {
    await this.getBuyer(buyerId, tenantId);

    const req = await this.prisma.depositReleaseRequest.findFirst({
      where: { id, buyerId, tenantId },
    });
    if (!req) throw new NotFoundException(`DepositReleaseRequest ${id} not found`);
    if (req.status !== 'PENDING') {
      throw new BadRequestException(`Request is already ${req.status}`);
    }

    const amountDecimal = req.amount;
    const amountCents = Math.round(Number(amountDecimal) * 100);

    // 1) Ledger debit — NEGATIVE amount reduces balance.
    await this.prisma.customerLedgerEntry.create({
      data: {
        tenantId,
        buyerId,
        type: 'ADJUSTMENT',
        status: 'COMPLETED',
        amount: new Prisma.Decimal(-amountCents / 100),
        currency: req.currency,
        description: 'Liberación de depósito aprobada',
        source: 'manual',
        createdById: staffUserId ?? undefined,
      },
    });

    // 2) Best-effort Stripe refund against most recent DEPOSIT PortalOrder.
    let stripeRefundId: string | null = null;
    try {
      const depositOrder = await this.prisma.portalOrder.findFirst({
        where: { buyerId, tenantId, type: 'DEPOSIT', stripePaymentIntentId: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: { stripePaymentIntentId: true, amount: true },
      });
      if (depositOrder?.stripePaymentIntentId) {
        const piAmountCents = Math.round(Number(depositOrder.amount) * 100);
        const refundAmount = Math.min(amountCents, piAmountCents);
        const refund = await this.stripe.refunds.create({
          payment_intent: depositOrder.stripePaymentIntentId,
          amount: refundAmount,
        });
        stripeRefundId = refund.id;
        this.logger.log(
          `approveDepositRelease: Stripe refund ${refund.id} for $${(refundAmount / 100).toFixed(2)} (request ${id})`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `approveDepositRelease: Stripe refund failed for request ${id} — ${(err as Error).message}. Ledger debit already applied; approval proceeds.`,
      );
    }

    // 3) Mark APPROVED.
    const updated = await this.prisma.depositReleaseRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        decidedById: staffUserId ?? undefined,
        decidedAt: new Date(),
        decisionNote: note,
        stripeRefundId,
      },
    });
    return { ...updated, amount: updated.amount.toString() };
  }

  /** Reject a PENDING DepositReleaseRequest — no ledger change, no Stripe call. */
  async rejectDepositRelease(
    buyerId: string,
    tenantId: string,
    id: string,
    staffUserId: string | null,
    note?: string,
  ) {
    await this.getBuyer(buyerId, tenantId);

    const req = await this.prisma.depositReleaseRequest.findFirst({
      where: { id, buyerId, tenantId },
    });
    if (!req) throw new NotFoundException(`DepositReleaseRequest ${id} not found`);
    if (req.status !== 'PENDING') {
      throw new BadRequestException(`Request is already ${req.status}`);
    }

    const updated = await this.prisma.depositReleaseRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        decidedById: staffUserId ?? undefined,
        decidedAt: new Date(),
        decisionNote: note,
      },
    });
    return { ...updated, amount: updated.amount.toString() };
  }

  // ── Webhook Processing ────────────────────────────────

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type} (${event.id})`);

    switch (event.type) {
      // ── Payment Events ──────────────────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        this.logger.log(
          `Payment succeeded: ${pi.id} for $${(pi.amount / 100).toFixed(2)}`,
        );
        await this.emitStripeEvent(pi.customer as string, {
          type: 'payment_succeeded',
          amount: pi.amount,
          currency: pi.currency,
          status: pi.status,
          description: pi.description,
          paymentIntentId: pi.id,
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const errorMsg = pi.last_payment_error?.message ?? 'Unknown error';
        this.logger.warn(`Payment failed: ${pi.id} - ${errorMsg}`);
        await this.emitStripeEvent(pi.customer as string, {
          type: 'payment_failed',
          amount: pi.amount,
          currency: pi.currency,
          status: pi.status,
          description: pi.description,
          paymentIntentId: pi.id,
          errorMessage: errorMsg,
        });
        break;
      }

      // ── Refund Events ───────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const refund = charge.refunds?.data?.[0];
        this.logger.log(
          `Charge refunded: ${charge.id} — $${(charge.amount_refunded / 100).toFixed(2)}`,
        );
        const piId =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id;
        await this.emitStripeEvent(charge.customer as string, {
          type: 'refund_created',
          amount: charge.amount_refunded,
          currency: charge.currency,
          status: refund?.status ?? 'succeeded',
          description: null,
          paymentIntentId: piId,
          refundId: refund?.id,
        });
        break;
      }

      case 'charge.refund.updated': {
        const refund = event.data.object as Stripe.Refund;
        this.logger.log(
          `Refund updated: ${refund.id} — status: ${refund.status}`,
        );
        const piId =
          typeof refund.payment_intent === 'string'
            ? refund.payment_intent
            : refund.payment_intent?.id;
        // Retrieve the charge to get the customer
        let customerId: string | null = null;
        if (typeof refund.charge === 'string') {
          const ch = await this.stripe.charges.retrieve(refund.charge);
          customerId = ch.customer as string;
        } else if (refund.charge) {
          customerId = refund.charge.customer as string;
        }
        if (customerId) {
          const emitType =
            refund.status === 'failed' ? 'refund_failed' : 'refund_updated';
          await this.emitStripeEvent(customerId, {
            type: emitType,
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status ?? 'unknown',
            description: null,
            paymentIntentId: piId,
            refundId: refund.id,
          });
        }
        break;
      }

      // ── Setup Intent (new payment method) ───────────────
      case 'setup_intent.succeeded': {
        const si = event.data.object as Stripe.SetupIntent;
        this.logger.log(
          `Setup intent succeeded: ${si.id}, payment method: ${si.payment_method}`,
        );
        const pmId =
          typeof si.payment_method === 'string'
            ? si.payment_method
            : si.payment_method?.id;
        let pmDetails: { brand: string; last4: string } | null = null;
        if (pmId) {
          const pm = await this.stripe.paymentMethods.retrieve(pmId);
          pmDetails = {
            brand: pm.card?.brand || 'unknown',
            last4: pm.card?.last4 || '****',
          };
        }
        await this.emitStripeEvent(si.customer as string, {
          type: 'payment_method_attached',
          amount: 0,
          currency: 'usd',
          status: 'succeeded',
          description: null,
          paymentMethod: pmDetails,
        });
        break;
      }

      // ── Checkout Session (Payment Link paid) ────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'paid') {
          this.logger.log(
            `Checkout session completed: ${session.id} — $${((session.amount_total ?? 0) / 100).toFixed(2)}`,
          );

          // Portal order fulfillment (inspection or deposit).
          if (session.metadata?.portalOrderId && this.portalService) {
            await this.portalService.fulfillPortalOrder(session);
          }

          const piId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id;
          await this.emitStripeEvent(session.customer as string, {
            type: 'payment_succeeded',
            amount: session.amount_total ?? 0,
            currency: session.currency ?? 'usd',
            status: 'succeeded',
            description: null,
            paymentIntentId: piId,
          });
        }
        break;
      }

      case 'payment_method.detached': {
        const pm = event.data.object as Stripe.PaymentMethod;
        this.logger.log(`Payment method detached: ${pm.id}`);
        // Customer is null after detach, so we can't emit to tenant room
        // This event is already handled optimistically on the frontend
        break;
      }

      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Helper to resolve a Stripe customer ID to buyerId/tenantId and emit a WebSocket event.
   */
  private async emitStripeEvent(
    stripeCustomerId: string | null,
    payload: {
      type:
        | 'payment_succeeded'
        | 'payment_failed'
        | 'refund_created'
        | 'refund_updated'
        | 'refund_failed'
        | 'payment_method_attached'
        | 'payment_method_detached';
      amount: number;
      currency: string;
      status: string;
      description: string | null;
      paymentIntentId?: string;
      refundId?: string;
      paymentMethod?: { brand: string; last4: string } | null;
      errorMessage?: string | null;
    },
  ) {
    if (!stripeCustomerId) {
      this.logger.warn('Cannot emit Stripe event: no customer ID');
      return;
    }

    const buyer = await this.prisma.buyer.findFirst({
      where: { stripeCustomerId },
      select: { id: true, tenantId: true },
    });

    if (!buyer || !buyer.tenantId) {
      this.logger.warn(
        `No buyer found for Stripe customer ${stripeCustomerId}`,
      );
      return;
    }

    const event = {
      id: `evt_${Date.now()}`,
      tenantId: buyer.tenantId,
      buyerId: buyer.id,
      ...payload,
    };

    switch (payload.type) {
      case 'payment_succeeded':
        this.stripeEvents.emitPaymentSucceeded(event);
        break;
      case 'payment_failed':
        this.stripeEvents.emitPaymentFailed(event);
        break;
      case 'refund_created':
        this.stripeEvents.emitRefundCreated(event);
        break;
      case 'refund_updated':
        this.stripeEvents.emitRefundUpdated(event);
        break;
      case 'refund_failed':
        this.stripeEvents.emitRefundFailed(event);
        break;
      case 'payment_method_attached':
        this.stripeEvents.emitPaymentMethodAttached(event);
        break;
      case 'payment_method_detached':
        this.stripeEvents.emitPaymentMethodDetached(event);
        break;
    }
  }
}
