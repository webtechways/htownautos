"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PartOrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const shippo_service_1 = require("../shippo/shippo.service");
const stripe_service_1 = require("../stripe/stripe.service");
let PartOrdersService = PartOrdersService_1 = class PartOrdersService {
    prisma;
    shippo;
    stripe;
    logger = new common_1.Logger(PartOrdersService_1.name);
    constructor(prisma, shippo, stripe) {
        this.prisma = prisma;
        this.shippo = shippo;
        this.stripe = stripe;
    }
    async generateOrderNumber(tenantId) {
        const lastOrder = await this.prisma.partOrder.findFirst({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            select: { orderNumber: true },
        });
        const lastNum = lastOrder?.orderNumber?.match(/(\d+)$/)?.[1];
        const next = lastNum ? parseInt(lastNum) + 1 : 1;
        return `ORD-${next.toString().padStart(6, '0')}`;
    }
    async calculateTotals(items, taxRate, discount, shippingCost, tenantId) {
        let subtotal = 0;
        const resolvedItems = [];
        for (const item of items) {
            const part = await this.prisma.part.findFirst({
                where: { id: item.partId, tenantId },
            });
            if (!part)
                throw new common_1.NotFoundException(`Part ${item.partId} not found`);
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
    async findAll(tenantId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = { tenantId };
        if (query.status)
            where.status = query.status;
        if (query.buyerId)
            where.buyerId = query.buyerId;
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
    async findOne(tenantId, id) {
        const order = await this.prisma.partOrder.findFirst({
            where: { id, tenantId },
            include: {
                buyer: true,
                items: { include: { part: { include: { mainImage: true } } } },
                shipments: { include: { parcelTemplate: true }, orderBy: { createdAt: 'desc' } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        return order;
    }
    async create(tenantId, dto, userId) {
        const buyer = await this.prisma.buyer.findFirst({ where: { id: dto.buyerId, tenantId } });
        if (!buyer)
            throw new common_1.NotFoundException(`Buyer ${dto.buyerId} not found`);
        const { subtotal, tax, total, resolvedItems } = await this.calculateTotals(dto.items, dto.taxRate ?? 0, dto.discount ?? 0, 0, tenantId);
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
    async update(tenantId, id, dto) {
        const existing = await this.findOne(tenantId, id);
        let updateData = {
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
    async cancel(tenantId, id) {
        const order = await this.findOne(tenantId, id);
        if (order.status === 'cancelled')
            throw new common_1.BadRequestException('Order already cancelled');
        return this.prisma.partOrder.update({
            where: { id },
            data: { status: 'cancelled', cancelledAt: new Date() },
        });
    }
    async remove(tenantId, id) {
        const order = await this.findOne(tenantId, id);
        if (order.status !== 'draft') {
            throw new common_1.BadRequestException('Only draft orders can be deleted — cancel instead');
        }
        await this.prisma.partOrder.delete({ where: { id } });
        return { message: 'Order deleted' };
    }
    async removeBulk(tenantId, ids) {
        if (!ids || ids.length === 0) {
            throw new common_1.BadRequestException('No order ids provided');
        }
        const orders = await this.prisma.partOrder.findMany({
            where: { id: { in: ids }, tenantId },
            select: { id: true, orderNumber: true, status: true },
        });
        const foundIds = orders.map((o) => o.id);
        const notFound = ids.filter((id) => !foundIds.includes(id));
        if (notFound.length > 0) {
            throw new common_1.NotFoundException(`Orders not found or not accessible: ${notFound.join(', ')}`);
        }
        const nonDraft = orders.filter((o) => o.status !== 'draft');
        if (nonDraft.length > 0) {
            throw new common_1.BadRequestException(`Only draft orders can be deleted — cancel instead: ${nonDraft.map((o) => o.orderNumber).join(', ')}`);
        }
        const result = await this.prisma.partOrder.deleteMany({
            where: { id: { in: foundIds }, tenantId },
        });
        return {
            message: `${result.count} order(s) have been successfully deleted`,
            count: result.count,
        };
    }
    async charge(tenantId, id, dto, userId) {
        const order = await this.findOne(tenantId, id);
        if (order.paymentStatus === 'paid')
            throw new common_1.BadRequestException('Order already paid');
        const amountInCents = Math.round(Number(order.total) * 100);
        const description = `Order ${order.orderNumber}`;
        if (dto.mode === 'send_link_sms' || dto.mode === 'send_link_email') {
            const delivery = dto.mode === 'send_link_sms' ? 'sms' : 'email';
            const result = await this.stripe.createPaymentLink(order.buyerId, tenantId, amountInCents, description, `Payment request for order ${order.orderNumber}`, delivery, userId);
            await this.prisma.partOrder.update({
                where: { id },
                data: { paymentStatus: 'processing', paymentMethod: 'stripe' },
            });
            return { sent: true, url: result.url };
        }
        const payment = await this.stripe.createPayment(order.buyerId, tenantId, amountInCents, description, dto.paymentMethodId);
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
    async markPaid(tenantId, id, method = 'manual') {
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
    async estimateShipping(tenantId, dto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        const addressFrom = {
            name: tenant.name || 'Warehouse',
            street1: tenant.address || '1000 Main St',
            city: tenant.city || 'Houston',
            state: tenant.state || 'TX',
            zip: tenant.zipCode || '77001',
            country: tenant.country || 'US',
            phone: tenant.phone || '+17135551234',
            email: tenant.email || 'shipping@htownautos.com',
        };
        const addressTo = {
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
        const totalQty = dto.items.reduce((s, i) => s + i.quantity, 0);
        const weight = Math.max(5, totalQty * 3);
        const parcel = {
            length: 12, width: 9, height: 3,
            distance_unit: 'in',
            weight,
            mass_unit: 'lb',
        };
        const shipment = await this.shippo.createShipment({ addressFrom, addressTo, parcel });
        const rates = this.selectRates(shipment.rates || []);
        if (rates.length === 0) {
            throw new common_1.BadRequestException('No shipping rates available for this address');
        }
        const cheapest = rates.reduce((min, r) => Number(r.amount) < Number(min.amount) ? r : min);
        return {
            amount: Number(cheapest.amount),
            currency: cheapest.currency,
            provider: cheapest.provider,
            serviceLevel: cheapest.servicelevel?.token,
            serviceLevelName: cheapest.servicelevel?.name,
        };
    }
    selectRates(rates) {
        if (!rates || rates.length === 0)
            return [];
        const allowed = new Set(['ups', 'fedex']);
        return rates.filter((r) => allowed.has(r.provider?.toLowerCase() ?? ''));
    }
    async getRates(tenantId, id, dto) {
        const order = await this.findOne(tenantId, id);
        if (!order.shipToStreet1 || !order.shipToCity || !order.shipToZip) {
            throw new common_1.BadRequestException('Order has no shipping address');
        }
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        const addressFrom = {
            name: tenant.name || 'Warehouse',
            street1: tenant.address || '1000 Main St',
            city: tenant.city || 'Houston',
            state: tenant.state || 'TX',
            zip: tenant.zipCode || '77001',
            country: tenant.country || 'US',
            phone: tenant.phone || '+17135551234',
            email: tenant.email || 'shipping@htownautos.com',
        };
        const addressTo = {
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
        const parcel = {
            length: dto.length,
            width: dto.width,
            height: dto.height,
            distance_unit: dto.distanceUnit || 'in',
            weight: dto.weight,
            mass_unit: dto.massUnit || 'lb',
        };
        const shipment = await this.shippo.createShipment({ addressFrom, addressTo, parcel });
        const rates = this.selectRates(shipment.rates || []);
        return {
            shipmentId: shipment.objectId,
            rates: rates.map((r) => ({
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
    async buyLabel(tenantId, id, rateId, shipmentContext) {
        const order = await this.findOne(tenantId, id);
        const transaction = await this.shippo.buyLabel(rateId);
        const shipment = await this.prisma.partShipment.create({
            data: {
                orderId: order.id,
                parcelTemplateId: shipmentContext?.parcelTemplateId,
                carrier: 'ups',
                serviceLevel: transaction.rate?.servicelevel?.token,
                serviceLevelName: transaction.rate?.servicelevel?.name,
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
                cost: transaction.rate?.amount ? Number(transaction.rate.amount) : null,
                status: 'label_purchased',
                purchasedAt: new Date(),
            },
        });
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
    async refreshTracking(tenantId, id, shipmentId) {
        const order = await this.findOne(tenantId, id);
        const shipment = order.shipments.find((s) => s.id === shipmentId);
        if (!shipment || !shipment.trackingNumber)
            throw new common_1.NotFoundException('Shipment not found');
        const status = await this.shippo.getTracking(shipment.carrier, shipment.trackingNumber);
        if (!status)
            return shipment;
        const trackStatus = status.trackingStatus?.status;
        const updates = { trackingStatus: trackStatus };
        if (trackStatus === 'TRANSIT')
            updates.status = 'in_transit';
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
};
exports.PartOrdersService = PartOrdersService;
exports.PartOrdersService = PartOrdersService = PartOrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        shippo_service_1.ShippoService,
        stripe_service_1.StripeService])
], PartOrdersService);
//# sourceMappingURL=part-orders.service.js.map