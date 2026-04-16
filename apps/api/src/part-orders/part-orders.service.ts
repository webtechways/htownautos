import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { Prisma } from '@prisma/client';
import { ShippoService, ShippoAddressDto, ShippoParcelDto } from '../shippo/shippo.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateOrderDto, UpdateOrderDto, CreateShipmentDto, ChargeOrderDto, EstimateShippingDto } from './dto/order.dto';

@Injectable()
export class PartOrdersService {
  private readonly logger = new Logger(PartOrdersService.name);

  constructor(
    private prisma: PrismaService,
    private shippo: ShippoService,
    private stripe: StripeService,
  ) {}

  // ── Helpers ──────────────────────────────────────────

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const lastOrder = await this.prisma.partOrder.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });
    const lastNum = lastOrder?.orderNumber?.match(/(\d+)$/)?.[1];
    const next = lastNum ? parseInt(lastNum) + 1 : 1;
    return `ORD-${next.toString().padStart(6, '0')}`;
  }

  private async calculateTotals(
    items: Array<{ partId: string; quantity: number; unitPrice?: number }>,
    taxRate: number,
    discount: number,
    shippingCost: number,
    tenantId: string,
  ) {
    let subtotal = 0;
    const resolvedItems: Array<{
      partId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      nameSnapshot: string;
      skuSnapshot: string | null;
    }> = [];

    for (const item of items) {
      const part = await this.prisma.part.findFirst({
        where: { id: item.partId, tenantId },
      });
      if (!part) throw new NotFoundException(`Part ${item.partId} not found`);

      const unitPrice = item.unitPrice ?? Number(part.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;
      resolvedItems.push({
        partId: part.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        nameSnapshot: part.name,
        skuSnapshot: part.sku ?? part.partNumber ?? null,
      });
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * (taxRate || 0);
    const total = taxableAmount + tax + shippingCost;

    return { subtotal, tax, total, resolvedItems };
  }

  // ── CRUD ─────────────────────────────────────────────

  async findAll(tenantId: string, query: { page?: number; limit?: number; status?: string; search?: string; buyerId?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.PartOrderWhereInput = { tenantId };
    if (query.status) where.status = query.status;
    if (query.buyerId) where.buyerId = query.buyerId;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { buyer: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { buyer: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { buyer: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.partOrder.count({ where }),
      this.prisma.partOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, firstName: true, lastName: true, email: true, phoneMain: true } },
          items: true,
          shipments: true,
        },
      }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total },
    };
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.partOrder.findFirst({
      where: { id, tenantId },
      include: {
        buyer: true,
        items: { include: { part: { include: { mainImage: true } } } },
        shipments: { include: { parcelTemplate: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async create(tenantId: string, dto: CreateOrderDto, userId?: string) {
    const buyer = await this.prisma.buyer.findFirst({ where: { id: dto.buyerId, tenantId } });
    if (!buyer) throw new NotFoundException(`Buyer ${dto.buyerId} not found`);

    const { subtotal, tax, total, resolvedItems } = await this.calculateTotals(
      dto.items,
      dto.taxRate ?? 0,
      dto.discount ?? 0,
      0,
      tenantId,
    );

    const orderNumber = await this.generateOrderNumber(tenantId);

    return this.prisma.partOrder.create({
      data: {
        tenantId,
        orderNumber,
        buyerId: dto.buyerId,
        status: 'draft',
        subtotal,
        taxRate: dto.taxRate ?? 0,
        tax,
        discount: dto.discount ?? 0,
        total,
        shippingMethod: dto.shippingMethod,
        shipToName: dto.shipTo?.name,
        shipToStreet1: dto.shipTo?.street1,
        shipToStreet2: dto.shipTo?.street2,
        shipToCity: dto.shipTo?.city,
        shipToState: dto.shipTo?.state,
        shipToZip: dto.shipTo?.zip,
        shipToCountry: dto.shipTo?.country ?? 'US',
        shipToPhone: dto.shipTo?.phone,
        shipToEmail: dto.shipTo?.email,
        notes: dto.notes,
        createdById: userId,
        items: { create: resolvedItems },
      },
      include: {
        buyer: true,
        items: { include: { part: true } },
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateOrderDto) {
    const existing = await this.findOne(tenantId, id);

    // Re-compute totals if items or rates changed
    let updateData: Prisma.PartOrderUpdateInput = {
      shippingMethod: dto.shippingMethod,
      shipToName: dto.shipTo?.name,
      shipToStreet1: dto.shipTo?.street1,
      shipToStreet2: dto.shipTo?.street2,
      shipToCity: dto.shipTo?.city,
      shipToState: dto.shipTo?.state,
      shipToZip: dto.shipTo?.zip,
      shipToCountry: dto.shipTo?.country,
      shipToPhone: dto.shipTo?.phone,
      shipToEmail: dto.shipTo?.email,
      notes: dto.notes,
      status: dto.status,
    };

    if (dto.items || dto.taxRate !== undefined || dto.discount !== undefined) {
      const items = dto.items ?? existing.items.map((i) => ({
        partId: i.partId, quantity: i.quantity, unitPrice: Number(i.unitPrice),
      }));
      const taxRate = dto.taxRate ?? Number(existing.taxRate);
      const discount = dto.discount ?? Number(existing.discount);
      const shippingCost = Number(existing.shippingCost);

      const { subtotal, tax, total, resolvedItems } = await this.calculateTotals(items, taxRate, discount, shippingCost, tenantId);

      updateData = {
        ...updateData,
        subtotal, tax, total, taxRate, discount,
        items: {
          deleteMany: {},
          create: resolvedItems,
        },
      };
    }

    return this.prisma.partOrder.update({
      where: { id },
      data: updateData,
      include: { buyer: true, items: { include: { part: true } }, shipments: true },
    });
  }

  async cancel(tenantId: string, id: string) {
    const order = await this.findOne(tenantId, id);
    if (order.status === 'cancelled') throw new BadRequestException('Order already cancelled');

    return this.prisma.partOrder.update({
      where: { id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
  }

  async remove(tenantId: string, id: string) {
    const order = await this.findOne(tenantId, id);
    if (order.status !== 'draft') {
      throw new BadRequestException('Only draft orders can be deleted — cancel instead');
    }
    await this.prisma.partOrder.delete({ where: { id } });
    return { message: 'Order deleted' };
  }

  async removeBulk(tenantId: string, ids: string[]): Promise<{ message: string; count: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No order ids provided');
    }

    const orders = await this.prisma.partOrder.findMany({
      where: { id: { in: ids }, tenantId },
      select: { id: true, orderNumber: true, status: true },
    });

    const foundIds = orders.map((o) => o.id);
    const notFound = ids.filter((id) => !foundIds.includes(id));
    if (notFound.length > 0) {
      throw new NotFoundException(
        `Orders not found or not accessible: ${notFound.join(', ')}`,
      );
    }

    const nonDraft = orders.filter((o) => o.status !== 'draft');
    if (nonDraft.length > 0) {
      throw new BadRequestException(
        `Only draft orders can be deleted — cancel instead: ${nonDraft.map((o) => o.orderNumber).join(', ')}`,
      );
    }

    const result = await this.prisma.partOrder.deleteMany({
      where: { id: { in: foundIds }, tenantId },
    });

    return {
      message: `${result.count} order(s) have been successfully deleted`,
      count: result.count,
    };
  }

  // ── Payment ──────────────────────────────────────────

  async charge(tenantId: string, id: string, dto: ChargeOrderDto, userId: string) {
    const order = await this.findOne(tenantId, id);
    if (order.paymentStatus === 'paid') throw new BadRequestException('Order already paid');

    const amountInCents = Math.round(Number(order.total) * 100);
    const description = `Order ${order.orderNumber}`;

    if (dto.mode === 'send_link_sms' || dto.mode === 'send_link_email') {
      const delivery = dto.mode === 'send_link_sms' ? 'sms' : 'email';
      const result = await this.stripe.createPaymentLink(
        order.buyerId,
        tenantId,
        amountInCents,
        description,
        `Payment request for order ${order.orderNumber}`,
        delivery,
        userId,
      );
      await this.prisma.partOrder.update({
        where: { id },
        data: { paymentStatus: 'processing', paymentMethod: 'stripe' },
      });
      return { sent: true, url: result.url };
    }

    // Direct charge
    const payment = await this.stripe.createPayment(
      order.buyerId,
      tenantId,
      amountInCents,
      description,
      dto.paymentMethodId,
    );

    await this.prisma.partOrder.update({
      where: { id },
      data: {
        paymentMethod: 'stripe',
        paymentStatus: payment.status === 'succeeded' ? 'paid' : 'processing',
        stripePaymentIntentId: payment.id,
        paidAt: payment.status === 'succeeded' ? new Date() : null,
        status: payment.status === 'succeeded' ? 'paid' : order.status,
      },
    });

    return payment;
  }

  async markPaid(tenantId: string, id: string, method = 'manual') {
    await this.findOne(tenantId, id);
    return this.prisma.partOrder.update({
      where: { id },
      data: {
        paymentStatus: 'paid',
        paymentMethod: method,
        paidAt: new Date(),
        status: 'paid',
      },
    });
  }

  // ── Shipping ─────────────────────────────────────────

  async estimateShipping(tenantId: string, dto: EstimateShippingDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const addressFrom: ShippoAddressDto = {
      name: tenant.name || 'Warehouse',
      street1: (tenant as any).address || '1000 Main St',
      city: (tenant as any).city || 'Houston',
      state: (tenant as any).state || 'TX',
      zip: (tenant as any).zipCode || '77001',
      country: (tenant as any).country || 'US',
      phone: (tenant as any).phone || '+17135551234',
      email: (tenant as any).email || 'shipping@htownautos.com',
    };

    const addressTo: ShippoAddressDto = {
      name: dto.shipTo.name,
      street1: dto.shipTo.street1,
      street2: dto.shipTo.street2,
      city: dto.shipTo.city,
      state: dto.shipTo.state,
      zip: dto.shipTo.zip,
      country: dto.shipTo.country || 'US',
      phone: dto.shipTo.phone,
      email: dto.shipTo.email,
    };

    // Default parcel — 3 lb per item, min 5 lb, standard medium box.
    const totalQty = dto.items.reduce((s, i) => s + i.quantity, 0);
    const weight = Math.max(5, totalQty * 3);
    const parcel: ShippoParcelDto = {
      length: 12, width: 9, height: 3,
      distance_unit: 'in',
      weight,
      mass_unit: 'lb',
    };

    const shipment = await this.shippo.createShipment({ addressFrom, addressTo, parcel });
    const rates = this.selectRates(shipment.rates || []);
    if (rates.length === 0) {
      throw new BadRequestException('No shipping rates available for this address');
    }
    // Cheapest rate.
    const cheapest = rates.reduce((min: any, r: any) =>
      Number(r.amount) < Number(min.amount) ? r : min
    );
    return {
      amount: Number(cheapest.amount),
      currency: cheapest.currency,
      provider: cheapest.provider,
      serviceLevel: cheapest.servicelevel?.token,
      serviceLevelName: cheapest.servicelevel?.name,
    };
  }

  /**
   * Restrict available rates to the carriers used by the US operation: UPS and
   * FedEx. Anything else (USPS, DHL, canada_post, etc.) is dropped so it never
   * appears in the buy-label UI.
   */
  private selectRates(rates: any[]): any[] {
    if (!rates || rates.length === 0) return [];
    const allowed = new Set(['ups', 'fedex']);
    return rates.filter((r) => allowed.has(r.provider?.toLowerCase() ?? ''));
  }

  async getRates(tenantId: string, id: string, dto: CreateShipmentDto) {
    const order = await this.findOne(tenantId, id);

    if (!order.shipToStreet1 || !order.shipToCity || !order.shipToZip) {
      throw new BadRequestException('Order has no shipping address');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const addressFrom: ShippoAddressDto = {
      name: tenant.name || 'Warehouse',
      street1: (tenant as any).address || '1000 Main St',
      city: (tenant as any).city || 'Houston',
      state: (tenant as any).state || 'TX',
      zip: (tenant as any).zipCode || '77001',
      country: (tenant as any).country || 'US',
      phone: (tenant as any).phone || '+17135551234',
      email: (tenant as any).email || 'shipping@htownautos.com',
    };

    const addressTo: ShippoAddressDto = {
      name: order.shipToName || `${order.buyer?.firstName ?? ''}`.trim() || 'Customer',
      street1: order.shipToStreet1,
      street2: order.shipToStreet2 ?? undefined,
      city: order.shipToCity,
      state: order.shipToState ?? '',
      zip: order.shipToZip,
      country: order.shipToCountry ?? 'US',
      phone: order.shipToPhone ?? undefined,
      email: order.shipToEmail ?? undefined,
    };

    const parcel: ShippoParcelDto = {
      length: dto.length,
      width: dto.width,
      height: dto.height,
      distance_unit: (dto.distanceUnit as 'in' | 'cm') || 'in',
      weight: dto.weight,
      mass_unit: (dto.massUnit as 'lb' | 'kg') || 'lb',
    };

    const shipment = await this.shippo.createShipment({ addressFrom, addressTo, parcel });
    const rates = this.selectRates(shipment.rates || []);

    return {
      shipmentId: shipment.objectId,
      rates: rates.map((r: any) => ({
        id: r.objectId,
        provider: r.provider,
        serviceLevel: r.servicelevel?.token,
        serviceLevelName: r.servicelevel?.name,
        amount: r.amount,
        currency: r.currency,
        estimatedDays: r.estimatedDays,
        durationTerms: r.durationTerms,
      })),
    };
  }

  async buyLabel(tenantId: string, id: string, rateId: string, shipmentContext?: CreateShipmentDto & { parcelTemplateId?: string }) {
    const order = await this.findOne(tenantId, id);

    const transaction = await this.shippo.buyLabel(rateId);

    const shipment = await this.prisma.partShipment.create({
      data: {
        orderId: order.id,
        parcelTemplateId: shipmentContext?.parcelTemplateId,
        carrier: 'ups',
        serviceLevel: (transaction as any).rate?.servicelevel?.token,
        serviceLevelName: (transaction as any).rate?.servicelevel?.name,
        length: shipmentContext?.length,
        width: shipmentContext?.width,
        height: shipmentContext?.height,
        distanceUnit: shipmentContext?.distanceUnit ?? 'in',
        weight: shipmentContext?.weight,
        massUnit: shipmentContext?.massUnit ?? 'lb',
        shippoTransactionId: transaction.objectId,
        shippoRateId: rateId,
        labelUrl: transaction.labelUrl,
        trackingNumber: transaction.trackingNumber,
        trackingUrl: transaction.trackingUrlProvider,
        trackingStatus: 'purchased',
        cost: (transaction as any).rate?.amount ? Number((transaction as any).rate.amount) : null,
        status: 'label_purchased',
        purchasedAt: new Date(),
      },
    });

    // Update order
    await this.prisma.partOrder.update({
      where: { id: order.id },
      data: {
        shippingCost: Number(shipment.cost ?? 0),
        total: Number(order.total) + Number(shipment.cost ?? 0),
        status: order.status === 'paid' ? 'ready_to_ship' : order.status,
      },
    });

    return shipment;
  }

  async refreshTracking(tenantId: string, id: string, shipmentId: string) {
    const order = await this.findOne(tenantId, id);
    const shipment = order.shipments.find((s) => s.id === shipmentId);
    if (!shipment || !shipment.trackingNumber) throw new NotFoundException('Shipment not found');

    const status = await this.shippo.getTracking(shipment.carrier, shipment.trackingNumber);
    if (!status) return shipment;

    const trackStatus = (status as any).trackingStatus?.status;
    const updates: Prisma.PartShipmentUpdateInput = { trackingStatus: trackStatus };

    if (trackStatus === 'TRANSIT') updates.status = 'in_transit';
    if (trackStatus === 'DELIVERED') {
      updates.status = 'delivered';
      updates.deliveredAt = new Date();
      await this.prisma.partOrder.update({
        where: { id: order.id },
        data: { status: 'delivered' },
      });
    }

    return this.prisma.partShipment.update({ where: { id: shipmentId }, data: updates });
  }
}
