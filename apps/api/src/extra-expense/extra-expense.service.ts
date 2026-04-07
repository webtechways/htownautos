import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { PrismaService } from '@htownautos/prisma';
import { MediaService } from '@htownautos/media';
import { CreateExtraExpenseDto } from './dto/create-extra-expense.dto';
import { UpdateExtraExpenseDto } from './dto/update-extra-expense.dto';
import { QueryExtraExpenseDto } from './dto/query-extra-expense.dto';
import { AnalyzeReceiptsDto, AnalyzeReceiptsResult } from './dto/analyze-receipts.dto';
import { ExtraExpenseEntity } from './entities/extra-expense.entity';
import { PaginatedResponseDto } from '@htownautos/common';

/** Shared include for queries that need vehicle + receipts + paidByUser */
const INCLUDE_RELATIONS = {
  vehicle: {
    select: {
      id: true,
      vin: true,
      stockNumber: true,
      year: { select: { year: true } },
      make: { select: { name: true } },
      model: { select: { name: true } },
    },
  },
  receipts: true,
  paidByUser: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
    },
  },
} as const;

@Injectable()
export class ExtraExpenseService {
  private readonly logger = new Logger(ExtraExpenseService.name);
  private readonly expense: ReturnType<PrismaService['getModel']>;
  private readonly vehicle: ReturnType<PrismaService['getModel']>;
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {
    this.expense = prisma.getModel('extraExpense');
    this.vehicle = prisma.getModel('vehicle');
    const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async create(dto: CreateExtraExpenseDto): Promise<ExtraExpenseEntity> {
    const vehicleRecord = await this.vehicle.findUnique({
      where: { id: dto.vehicleId },
      select: { id: true, tenantId: true },
    });
    if (!vehicleRecord) {
      throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`);
    }

    const record = await this.expense.create({
      data: {
        vehicleId: dto.vehicleId,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        ...(dto.shippingCost !== undefined && { shippingCost: new Prisma.Decimal(dto.shippingCost) }),
        ...(dto.tax !== undefined && { tax: new Prisma.Decimal(dto.tax) }),
        ...(dto.metaValue !== undefined && { metaValue: dto.metaValue }),
        ...(dto.paidByUserId !== undefined && { paidByUserId: dto.paidByUserId || null }),
        ...(dto.receiptIds?.length && {
          receipts: { connect: dto.receiptIds.map((id) => ({ id })) },
        }),
      },
      include: INCLUDE_RELATIONS,
    });

    return new ExtraExpenseEntity(record);
  }

  async findAll(
    query: QueryExtraExpenseDto,
  ): Promise<PaginatedResponseDto<ExtraExpenseEntity>> {
    const { page = 1, limit = 10, vehicleId } = query;
    const where: Prisma.ExtraExpenseWhereInput = {};

    if (vehicleId) {
      await this.ensureVehicleExists(vehicleId);
      where.vehicleId = vehicleId;
    }

    const [data, total] = await Promise.all([
      this.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: INCLUDE_RELATIONS,
      }),
      this.expense.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((row: Record<string, unknown>) => new ExtraExpenseEntity(row)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<ExtraExpenseEntity> {
    const record = await this.expense.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });

    if (!record) {
      throw new NotFoundException(`Extra expense ${id} not found`);
    }

    return new ExtraExpenseEntity(record);
  }

  async update(
    id: string,
    dto: UpdateExtraExpenseDto,
  ): Promise<ExtraExpenseEntity> {
    const existing = await this.expense.findUnique({
      where: { id },
      include: { vehicle: { select: { tenantId: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Extra expense ${id} not found`);
    }

    const record = await this.expense.update({
      where: { id },
      data: {
        ...(dto.description && { description: dto.description }),
        ...(dto.price !== undefined && { price: new Prisma.Decimal(dto.price) }),
        ...(dto.shippingCost !== undefined && { shippingCost: new Prisma.Decimal(dto.shippingCost) }),
        ...(dto.tax !== undefined && { tax: new Prisma.Decimal(dto.tax) }),
        ...(dto.metaValue !== undefined && { metaValue: dto.metaValue }),
        ...(dto.paidByUserId !== undefined && { paidByUserId: dto.paidByUserId || null }),
        ...(dto.receiptIds !== undefined && {
          receipts: { set: dto.receiptIds.map((rid) => ({ id: rid })) },
        }),
      },
      include: INCLUDE_RELATIONS,
    });

    return new ExtraExpenseEntity(record);
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.expense.findUnique({
      where: { id },
      include: { vehicle: { select: { tenantId: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Extra expense ${id} not found`);
    }

    await this.expense.delete({ where: { id } });

    return { message: `Extra expense ${id} deleted` };
  }

  async getVehicleTotal(vehicleId: string): Promise<{ total: number }> {
    await this.ensureVehicleExists(vehicleId);

    const result = await this.expense.aggregate({
      where: { vehicleId },
      _sum: { price: true },
    });

    return { total: Number(result._sum.price ?? 0) };
  }

  async analyzeReceipts(dto: AnalyzeReceiptsDto): Promise<AnalyzeReceiptsResult> {
    // Get signed URLs for all receipt images
    const imageUrls: string[] = [];
    for (const mediaId of dto.receiptIds) {
      const { url } = await this.mediaService.getSignedUrl(mediaId, 3600);
      imageUrls.push(url);
    }

    const prompt = `You are a receipt/invoice analysis expert. Analyze the receipt image(s) provided and extract the following information:

1. A short description of what was purchased (e.g., "Auto parts from AutoZone", "Oil change at Jiffy Lube")
2. Individual line items with their names and amounts (before tax/shipping)
3. Shipping cost (if any)
4. Tax amount (if any)
5. The grand total

Return ONLY a valid JSON object with this exact structure, no markdown, no code blocks, no explanation:
{"description":"Short description","items":[{"item":"Item name","amount":123.45}],"shippingCost":0,"tax":0,"total":123.45}

Important:
- All amounts must be numbers (not strings)
- If you can't read a specific item name, use a reasonable description
- shippingCost should be the shipping/delivery/freight cost shown on the receipt, or 0 if none
- tax should be the sales tax / VAT amount shown on the receipt, or 0 if none
- The total should match the receipt grand total (items + shipping + tax)
- If there are multiple receipts, combine all items into a single response and sum the totals, shipping costs, and taxes`;

    this.logger.log(`→ OpenAI Receipt Analysis: Analyzing ${imageUrls.length} receipt(s)`);
    const start = Date.now();

    try {
      const content: OpenAI.ChatCompletionContentPart[] = [
        { type: 'text', text: prompt },
        ...imageUrls.map((url): OpenAI.ChatCompletionContentPart => ({
          type: 'image_url',
          image_url: { url, detail: 'high' },
        })),
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content }],
        max_tokens: 2048,
        temperature: 0.1,
      });

      const duration = Date.now() - start;
      const raw = response.choices[0]?.message?.content?.trim();
      this.logger.log(`← OpenAI Receipt Analysis OK (${duration}ms) tokens=${response.usage?.total_tokens}`);

      if (!raw) {
        throw new InternalServerErrorException('OpenAI returned empty response');
      }

      let result: AnalyzeReceiptsResult;
      try {
        const cleaned = raw
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        result = JSON.parse(cleaned);
      } catch {
        this.logger.error(`Failed to parse receipt analysis response: ${raw}`);
        throw new InternalServerErrorException('Failed to parse receipt analysis response');
      }

      // Validate structure
      if (!result.description || !Array.isArray(result.items) || typeof result.total !== 'number') {
        throw new InternalServerErrorException('Invalid receipt analysis response structure');
      }

      // Ensure shipping and tax default to 0
      result.shippingCost = typeof result.shippingCost === 'number' ? result.shippingCost : 0;
      result.tax = typeof result.tax === 'number' ? result.tax : 0;

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`← OpenAI Receipt Analysis FAILED (${duration}ms): ${error}`);
      throw new InternalServerErrorException('Failed to analyze receipts');
    }
  }

  // ── Private helpers ──────────────────────────────────────────

  private async ensureVehicleExists(vehicleId: string): Promise<void> {
    const exists = await this.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    }
  }

  private async ensureExpenseExists(id: string): Promise<void> {
    const exists = await this.expense.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Extra expense ${id} not found`);
    }
  }
}
