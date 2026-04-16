import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealDto } from './dto/query-deal.dto';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class DealService {
  private readonly logger = new Logger(DealService.name);

  constructor(private prisma: PrismaService) {}

  private generateDealNumber(): string {
    const prefix = 'HTW-D';
    const seq = randomBytes(3).toString('hex').toUpperCase().slice(0, 6);
    return `${prefix}-${seq}`;
  }

  async create(createDealDto: CreateDealDto, tenantId: string) {
    const { dealType, ...data } = createDealDto;

    // Validate buyer exists
    const buyer = await this.prisma.buyer.findFirst({
      where: { id: data.buyerId, tenantId },
    });
    if (!buyer) {
      throw new BadRequestException('Buyer not found');
    }

    // Validate vehicle exists
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: data.vehicleId, tenantId },
    });
    if (!vehicle) {
      throw new BadRequestException('Vehicle not found');
    }

    // Validate co-buyer if provided
    if (data.coBuyerId) {
      const coBuyer = await this.prisma.buyer.findFirst({
        where: { id: data.coBuyerId, tenantId },
      });
      if (!coBuyer) {
        throw new BadRequestException('Co-Buyer not found');
      }
    }

    // Get or create default deal status
    let dealStatusId = data.dealStatusId;
    if (!dealStatusId) {
      const defaultStatus = await this.prisma.dealStatus.findFirst({
        where: { slug: 'pending', OR: [{ tenantId }, { tenantId: null }] },
      });
      if (defaultStatus) {
        dealStatusId = defaultStatus.id;
      } else {
        const created = await this.prisma.dealStatus.create({
          data: { slug: 'pending', title: 'Pending', tenantId },
        });
        dealStatusId = created.id;
      }
    }

    // Get or create finance type based on deal type
    let financeTypeId = data.financeTypeId;
    if (!financeTypeId) {
      const ft = await this.prisma.financeType.findFirst({
        where: { slug: dealType },
      });
      if (ft) {
        financeTypeId = ft.id;
      } else {
        const created = await this.prisma.financeType.create({
          data: { slug: dealType, title: dealType.charAt(0).toUpperCase() + dealType.slice(1) },
        });
        financeTypeId = created.id;
      }
    }

    // Calculate fees
    const totalFees = (data.salesTax || 0) + (data.docFee || 0) + (data.titleFee || 0) +
      (data.registrationFee || 0) + (data.otherFees || 0);

    // Calculate trade-in equity
    const tradeInEquity = data.hasTradeIn
      ? (data.tradeInAllowance || 0) - (data.tradeInPayoff || 0)
      : 0;

    // Calculate totals
    const totalCashPrice = data.sellingPrice - (data.discount || 0) - (data.rebate || 0) + totalFees;
    const amountFinanced = totalCashPrice - (data.downPayment || 0) - tradeInEquity;

    // Calculate aftermarket products total
    const totalAftermarketProducts =
      (data.warrantyCost || 0) + (data.gapCost || 0) +
      (data.maintenanceCost || 0) + (data.theftProtectionCost || 0) +
      (data.paintProtectionCost || 0);

    // Calculate finance charge and total of payments
    const financeCharge = data.term && data.monthlyPayment
      ? (data.monthlyPayment * data.term) - (amountFinanced > 0 ? amountFinanced : 0)
      : 0;
    const totalOfPayments = data.term && data.monthlyPayment
      ? data.monthlyPayment * data.term
      : 0;

    const deal = await this.prisma.deal.create({
      data: {
        dealNumber: this.generateDealNumber(),
        buyerId: data.buyerId,
        vehicleId: data.vehicleId,
        coBuyerId: data.coBuyerId || null,
        dealStatusId: dealStatusId!,
        financeTypeId: financeTypeId!,
        dealDate: data.dealDate ? new Date(data.dealDate) : new Date(),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        vehiclePrice: data.vehiclePrice,
        sellingPrice: data.sellingPrice,
        discount: data.discount || 0,
        rebate: data.rebate || 0,
        // Fees
        salesTax: data.salesTax || 0,
        docFee: data.docFee || 0,
        titleFee: data.titleFee || 0,
        registrationFee: data.registrationFee || 0,
        otherFees: data.otherFees || 0,
        totalFees,
        totalCashPrice,
        // Finance
        downPayment: data.downPayment || 0,
        amountFinanced: amountFinanced > 0 ? amountFinanced : 0,
        apr: data.apr || 0,
        term: data.term || 0,
        monthlyPayment: data.monthlyPayment || 0,
        totalOfPayments: totalOfPayments > 0 ? totalOfPayments : 0,
        financeCharge: financeCharge > 0 ? financeCharge : 0,
        lenderName: data.lenderName || null,
        lenderId: data.lenderId || null,
        lenderRate: data.lenderRate ?? null,
        dealerReserve: data.dealerReserve ?? null,
        buyRate: data.buyRate ?? null,
        sellRate: data.sellRate ?? null,
        // Trade-in
        hasTradeIn: data.hasTradeIn || false,
        tradeInYear: data.tradeInYear || null,
        tradeInMake: data.tradeInMake || null,
        tradeInModel: data.tradeInModel || null,
        tradeInVin: data.tradeInVin || null,
        tradeInMileage: data.tradeInMileage || null,
        tradeInActualValue: data.tradeInActualValue || 0,
        tradeInAllowance: data.tradeInAllowance || 0,
        tradeInPayoff: data.tradeInPayoff || 0,
        tradeInLienHolder: data.tradeInLienHolder || null,
        tradeInEquity,
        // Products / VSC
        hasWarranty: data.hasWarranty || false,
        warrantyProvider: data.warrantyProvider || null,
        warrantyCost: data.warrantyCost || 0,
        warrantyTerm: data.warrantyTerm || null,
        warrantyDeductible: data.warrantyDeductible || null,
        hasGap: data.hasGap || false,
        gapProvider: data.gapProvider || null,
        gapCost: data.gapCost || 0,
        hasMaintenancePlan: data.hasMaintenancePlan || false,
        maintenanceProvider: data.maintenanceProvider || null,
        maintenanceCost: data.maintenanceCost || 0,
        hasTheftProtection: data.hasTheftProtection || false,
        theftProtectionCost: data.theftProtectionCost || 0,
        hasPaintProtection: data.hasPaintProtection || false,
        paintProtectionCost: data.paintProtectionCost || 0,
        totalAftermarketProducts,
        // Credit / Compliance
        creditCheckConsent: data.creditCheckConsent || false,
        creditCheckDate: data.creditCheckConsent ? new Date() : null,
        creditScore: data.creditScore || null,
        // Personnel
        salesPersonId: data.salesPersonId || null,
        salesManagerId: data.salesManagerId || null,
        financeManagerId: data.financeManagerId || null,
        notes: data.notes || null,
        internalNotes: data.internalNotes || null,
        tenantId,
      },
      include: {
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
        vehicle: { select: { id: true, stockNumber: true, year: true, make: true, model: true } },
        dealStatus: true,
        financeType: true,
      },
    });

    return deal;
  }

  async findAll(query: QueryDealDto, tenantId: string) {
    const {
      search,
      buyerId,
      vehicleId,
      dealStatusId,
      financeTypeId,
      page = 1,
      limit = 20,
      sortBy = 'dealDate',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.DealWhereInput = { tenantId };

    if (search) {
      where.OR = [
        { dealNumber: { contains: search, mode: 'insensitive' } },
        { buyer: { firstName: { contains: search, mode: 'insensitive' } } },
        { buyer: { lastName: { contains: search, mode: 'insensitive' } } },
        { vehicle: { stockNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (buyerId) where.buyerId = buyerId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (dealStatusId) where.dealStatusId = dealStatusId;
    if (financeTypeId) where.financeTypeId = financeTypeId;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.deal.findMany({
        where,
        include: {
          buyer: { select: { id: true, firstName: true, lastName: true, email: true, phoneMain: true } },
          vehicle: { select: { id: true, stockNumber: true, year: true, make: true, model: true, trim: true } },
          dealStatus: true,
          financeType: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, tenantId },
      include: {
        buyer: true,
        coBuyer: true,
        vehicle: true,
        dealStatus: true,
        financeType: true,
      },
    });

    if (!deal) throw new NotFoundException(`Deal not found`);
    return deal;
  }

  async update(id: string, data: Partial<CreateDealDto>, tenantId: string) {
    await this.findOne(id, tenantId);

    const { dealType, ...updateData } = data;

    return this.prisma.deal.update({
      where: { id },
      data: updateData as any,
      include: {
        buyer: { select: { id: true, firstName: true, lastName: true } },
        vehicle: { select: { id: true, stockNumber: true, year: true, make: true, model: true } },
        dealStatus: true,
        financeType: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.deal.delete({ where: { id } });
    return { message: 'Deal deleted successfully' };
  }
}
