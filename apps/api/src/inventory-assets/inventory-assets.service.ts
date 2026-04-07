import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { MediaService } from '@htownautos/media';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import {
  CreateInventoryAssetDto,
  UpdateInventoryAssetDto,
  QueryInventoryAssetDto,
} from './dto';

@Injectable()
export class InventoryAssetsService {
  private readonly logger = new Logger(InventoryAssetsService.name);
  private readonly openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  private async generateAssetTag(tenantId: string): Promise<string> {
    const prefix = 'HTW-A-';
    const last = await this.prisma.inventoryAsset.findFirst({
      where: { tenantId, assetTag: { startsWith: prefix } },
      orderBy: { assetTag: 'desc' },
      select: { assetTag: true },
    });

    let nextNumber = 1;
    if (last?.assetTag) {
      const parsed = parseInt(last.assetTag.replace(prefix, ''), 10);
      if (!isNaN(parsed)) nextNumber = parsed + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  async create(tenantId: string, dto: CreateInventoryAssetDto) {
    if (!dto.assetTag) {
      dto.assetTag = await this.generateAssetTag(tenantId);
    }

    return this.prisma.inventoryAsset.create({
      data: {
        tenantId,
        name: dto.name,
        assetTag: dto.assetTag,
        serialNumber: dto.serialNumber,
        description: dto.description,
        notes: dto.notes,
        category: dto.category,
        status: dto.status ?? 'available',
        condition: dto.condition ?? 'good',
        location: dto.location,
        assignedTo: dto.assignedTo,
        brand: dto.brand,
        model: dto.model,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        purchasePrice: dto.purchasePrice,
        currentValue: dto.currentValue,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
        supplier: dto.supplier,
        quantity: dto.quantity ?? 1,
        shippingCost: dto.shippingCost,
        tax: dto.tax,
        receiptIds: dto.receiptIds ?? [],
        imageUrl: dto.imageUrl,
      },
    });
  }

  async findAll(tenantId: string, query: QueryInventoryAssetDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryAssetWhereInput = { tenantId };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { assetTag: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.condition) where.condition = query.condition;
    if (query.location) where.location = { contains: query.location, mode: 'insensitive' };
    if (query.assignedTo) where.assignedTo = { contains: query.assignedTo, mode: 'insensitive' };

    const orderBy: Prisma.InventoryAssetOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.inventoryAsset.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.inventoryAsset.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const asset = await this.prisma.inventoryAsset.findFirst({
      where: { id, tenantId },
    });
    if (!asset) throw new NotFoundException(`Inventory asset with ID '${id}' not found`);
    return asset;
  }

  async update(tenantId: string, id: string, dto: UpdateInventoryAssetDto) {
    await this.findOne(tenantId, id);

    return this.prisma.inventoryAsset.update({
      where: { id },
      data: {
        ...dto,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.inventoryAsset.delete({ where: { id } });
    return { message: 'Asset deleted successfully' };
  }

  async analyzeImages(mediaIds: string[]) {
    const imageUrls: string[] = [];
    for (const mediaId of mediaIds) {
      const { url } = await this.mediaService.getSignedUrl(mediaId, 3600);
      imageUrls.push(url);
    }

    const prompt = `You are an inventory asset identification expert. Analyze the image(s) of a tool, equipment, or fixed asset and extract as much information as possible.

Return ONLY a valid JSON object with this exact structure, no markdown, no code blocks, no explanation:
{"name":"Product name","brand":"Brand name","model":"Model number","serialNumber":"Serial number if visible","category":"tool|equipment|furniture|electronics|vehicle_accessory|other","description":"Brief description","supplier":"Store/supplier if visible on packaging or receipt","purchaseDate":"YYYY-MM-DD if visible","purchasePrice":0,"shippingCost":0,"tax":0,"notes":"Any additional info like warranty, specs, etc.","condition":"new|good|fair|poor"}

Important:
- Only include fields where you can identify the information from the image(s)
- For fields you cannot determine, use null
- name should be the product name (e.g., "Milwaukee M18 Impact Wrench")
- brand should be just the brand/manufacturer (e.g., "Milwaukee")
- model should be the model number/name (e.g., "2767-20")
- category must be one of: tool, equipment, furniture, electronics, vehicle_accessory, other
- condition: if the item looks new/in packaging use "new", otherwise estimate
- If a receipt or price tag is visible, extract purchasePrice, tax, shippingCost
- purchaseDate format must be YYYY-MM-DD
- All price amounts must be numbers (not strings), use null if unknown`;

    this.logger.log(`→ OpenAI Asset Analysis: Analyzing ${imageUrls.length} image(s)`);
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
      this.logger.log(`← OpenAI Asset Analysis OK (${duration}ms) tokens=${response.usage?.total_tokens}`);

      if (!raw) {
        throw new InternalServerErrorException('OpenAI returned empty response');
      }

      try {
        const cleaned = raw
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        return JSON.parse(cleaned);
      } catch {
        this.logger.error(`Failed to parse asset analysis response: ${raw}`);
        throw new InternalServerErrorException('Failed to parse asset analysis response');
      }
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(`← OpenAI Asset Analysis FAILED (${duration}ms): ${error}`);
      throw new InternalServerErrorException('Failed to analyze images');
    }
  }
}
