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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ExtraExpenseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtraExpenseService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const openai_1 = __importDefault(require("openai"));
const prisma_1 = require("@htownautos/prisma");
const media_1 = require("@htownautos/media");
const extra_expense_entity_1 = require("./entities/extra-expense.entity");
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
};
let ExtraExpenseService = ExtraExpenseService_1 = class ExtraExpenseService {
    prisma;
    mediaService;
    logger = new common_1.Logger(ExtraExpenseService_1.name);
    expense;
    vehicle;
    openai;
    constructor(prisma, mediaService) {
        this.prisma = prisma;
        this.mediaService = mediaService;
        this.expense = prisma.getModel('extraExpense');
        this.vehicle = prisma.getModel('vehicle');
        const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async create(dto) {
        const vehicleRecord = await this.vehicle.findUnique({
            where: { id: dto.vehicleId },
            select: { id: true, tenantId: true },
        });
        if (!vehicleRecord) {
            throw new common_1.NotFoundException(`Vehicle ${dto.vehicleId} not found`);
        }
        const record = await this.expense.create({
            data: {
                vehicleId: dto.vehicleId,
                description: dto.description,
                price: new client_1.Prisma.Decimal(dto.price),
                ...(dto.shippingCost !== undefined && { shippingCost: new client_1.Prisma.Decimal(dto.shippingCost) }),
                ...(dto.tax !== undefined && { tax: new client_1.Prisma.Decimal(dto.tax) }),
                ...(dto.metaValue !== undefined && { metaValue: dto.metaValue }),
                ...(dto.paidByUserId !== undefined && { paidByUserId: dto.paidByUserId || null }),
                ...(dto.receiptIds?.length && {
                    receipts: { connect: dto.receiptIds.map((id) => ({ id })) },
                }),
            },
            include: INCLUDE_RELATIONS,
        });
        return new extra_expense_entity_1.ExtraExpenseEntity(record);
    }
    async findAll(query) {
        const { page = 1, limit = 10, vehicleId } = query;
        const where = {};
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
            data: data.map((row) => new extra_expense_entity_1.ExtraExpenseEntity(row)),
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
    async findOne(id) {
        const record = await this.expense.findUnique({
            where: { id },
            include: INCLUDE_RELATIONS,
        });
        if (!record) {
            throw new common_1.NotFoundException(`Extra expense ${id} not found`);
        }
        return new extra_expense_entity_1.ExtraExpenseEntity(record);
    }
    async update(id, dto) {
        const existing = await this.expense.findUnique({
            where: { id },
            include: { vehicle: { select: { tenantId: true } } },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Extra expense ${id} not found`);
        }
        const record = await this.expense.update({
            where: { id },
            data: {
                ...(dto.description && { description: dto.description }),
                ...(dto.price !== undefined && { price: new client_1.Prisma.Decimal(dto.price) }),
                ...(dto.shippingCost !== undefined && { shippingCost: new client_1.Prisma.Decimal(dto.shippingCost) }),
                ...(dto.tax !== undefined && { tax: new client_1.Prisma.Decimal(dto.tax) }),
                ...(dto.metaValue !== undefined && { metaValue: dto.metaValue }),
                ...(dto.paidByUserId !== undefined && { paidByUserId: dto.paidByUserId || null }),
                ...(dto.receiptIds !== undefined && {
                    receipts: { set: dto.receiptIds.map((rid) => ({ id: rid })) },
                }),
            },
            include: INCLUDE_RELATIONS,
        });
        return new extra_expense_entity_1.ExtraExpenseEntity(record);
    }
    async remove(id) {
        const existing = await this.expense.findUnique({
            where: { id },
            include: { vehicle: { select: { tenantId: true } } },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Extra expense ${id} not found`);
        }
        await this.expense.delete({ where: { id } });
        return { message: `Extra expense ${id} deleted` };
    }
    async getVehicleTotal(vehicleId) {
        await this.ensureVehicleExists(vehicleId);
        const result = await this.expense.aggregate({
            where: { vehicleId },
            _sum: { price: true },
        });
        return { total: Number(result._sum.price ?? 0) };
    }
    async analyzeReceipts(dto) {
        const imageUrls = [];
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
            const content = [
                { type: 'text', text: prompt },
                ...imageUrls.map((url) => ({
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
                throw new common_1.InternalServerErrorException('OpenAI returned empty response');
            }
            let result;
            try {
                const cleaned = raw
                    .replace(/^```(?:json)?\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();
                result = JSON.parse(cleaned);
            }
            catch {
                this.logger.error(`Failed to parse receipt analysis response: ${raw}`);
                throw new common_1.InternalServerErrorException('Failed to parse receipt analysis response');
            }
            if (!result.description || !Array.isArray(result.items) || typeof result.total !== 'number') {
                throw new common_1.InternalServerErrorException('Invalid receipt analysis response structure');
            }
            result.shippingCost = typeof result.shippingCost === 'number' ? result.shippingCost : 0;
            result.tax = typeof result.tax === 'number' ? result.tax : 0;
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`← OpenAI Receipt Analysis FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to analyze receipts');
        }
    }
    async ensureVehicleExists(vehicleId) {
        const exists = await this.vehicle.findUnique({
            where: { id: vehicleId },
            select: { id: true },
        });
        if (!exists) {
            throw new common_1.NotFoundException(`Vehicle ${vehicleId} not found`);
        }
    }
    async ensureExpenseExists(id) {
        const exists = await this.expense.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists) {
            throw new common_1.NotFoundException(`Extra expense ${id} not found`);
        }
    }
};
exports.ExtraExpenseService = ExtraExpenseService;
exports.ExtraExpenseService = ExtraExpenseService = ExtraExpenseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        media_1.MediaService])
], ExtraExpenseService);
//# sourceMappingURL=extra-expense.service.js.map