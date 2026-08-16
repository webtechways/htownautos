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
var InventoryAssetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const media_1 = require("@htownautos/media");
const openai_1 = __importDefault(require("openai"));
let InventoryAssetsService = InventoryAssetsService_1 = class InventoryAssetsService {
    prisma;
    mediaService;
    logger = new common_1.Logger(InventoryAssetsService_1.name);
    openai;
    constructor(prisma, mediaService) {
        this.prisma = prisma;
        this.mediaService = mediaService;
        const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async generateAssetTag(tenantId) {
        const prefix = 'HTW-A-';
        const last = await this.prisma.inventoryAsset.findFirst({
            where: { tenantId, assetTag: { startsWith: prefix } },
            orderBy: { assetTag: 'desc' },
            select: { assetTag: true },
        });
        let nextNumber = 1;
        if (last?.assetTag) {
            const parsed = parseInt(last.assetTag.replace(prefix, ''), 10);
            if (!isNaN(parsed))
                nextNumber = parsed + 1;
        }
        return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
    }
    async create(tenantId, dto) {
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
    async getStats(tenantId) {
        const result = await this.prisma.$queryRaw `SELECT
        COALESCE(SUM(quantity), 0) as total_items,
        COALESCE(SUM(CAST("purchasePrice" AS DOUBLE PRECISION) * quantity), 0) as total_value
      FROM inventory_assets WHERE "tenantId" = ${tenantId}`;
        const row = result[0];
        return {
            totalItems: Number(row?.total_items || 0),
            totalValue: Number(row?.total_value || 0),
        };
    }
    async findAll(tenantId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const where = { tenantId };
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { assetTag: { contains: query.search, mode: 'insensitive' } },
                { serialNumber: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.category)
            where.category = query.category;
        if (query.status)
            where.status = query.status;
        if (query.condition)
            where.condition = query.condition;
        if (query.location)
            where.location = { contains: query.location, mode: 'insensitive' };
        if (query.assignedTo)
            where.assignedTo = { contains: query.assignedTo, mode: 'insensitive' };
        const orderBy = {
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
    async findOne(tenantId, id) {
        const asset = await this.prisma.inventoryAsset.findFirst({
            where: { id, tenantId },
        });
        if (!asset)
            throw new common_1.NotFoundException(`Inventory asset with ID '${id}' not found`);
        return asset;
    }
    async update(tenantId, id, dto) {
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
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        await this.prisma.inventoryAsset.delete({ where: { id } });
        return { message: 'Asset deleted successfully' };
    }
    extractStructuredData(html, baseUrl) {
        const sections = [];
        const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        const jsonLdBlocks = [];
        while ((match = jsonLdRegex.exec(html)) !== null) {
            jsonLdBlocks.push(match[1].trim());
        }
        if (jsonLdBlocks.length > 0) {
            sections.push('=== JSON-LD Structured Data ===');
            sections.push(jsonLdBlocks.join('\n---\n'));
        }
        const ogRegex = /<meta\s+(?:property|name)=["'](og:[^"']+)["']\s+content=["']([^"']*)["'][^>]*\/?>/gi;
        const ogTags = [];
        while ((match = ogRegex.exec(html)) !== null) {
            ogTags.push(`${match[1]}: ${match[2]}`);
        }
        const ogRegex2 = /<meta\s+content=["']([^"']*)["']\s+(?:property|name)=["'](og:[^"']+)["'][^>]*\/?>/gi;
        while ((match = ogRegex2.exec(html)) !== null) {
            ogTags.push(`${match[2]}: ${match[1]}`);
        }
        if (ogTags.length > 0) {
            sections.push('=== Open Graph Meta Tags ===');
            sections.push(ogTags.join('\n'));
        }
        const metaRegex = /<meta\s+name=["'](description|keywords|author|product[:\-_]\w+|title)["']\s+content=["']([^"']*)["'][^>]*\/?>/gi;
        const metaTags = [];
        while ((match = metaRegex.exec(html)) !== null) {
            metaTags.push(`${match[1]}: ${match[2]}`);
        }
        if (metaTags.length > 0) {
            sections.push('=== Meta Tags ===');
            sections.push(metaTags.join('\n'));
        }
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch) {
            sections.push(`=== Page Title ===\n${titleMatch[1].trim()}`);
        }
        const itemPropRegex = /<[^>]+itemprop=["']([^"']+)["'][^>]*(?:content=["']([^"']*)["'])?[^>]*>([^<]*)/gi;
        const microdata = [];
        while ((match = itemPropRegex.exec(html)) !== null) {
            const value = match[2] || match[3]?.trim();
            if (value)
                microdata.push(`${match[1]}: ${value}`);
        }
        if (microdata.length > 0) {
            sections.push('=== Microdata (itemprop) ===');
            sections.push([...new Set(microdata)].join('\n'));
        }
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
        const images = [];
        while ((match = imgRegex.exec(html)) !== null) {
            const src = match[1];
            const alt = match[2] || '';
            if (src && !src.includes('pixel') && !src.includes('spacer') && !src.includes('icon') &&
                !src.includes('.svg') && !src.endsWith('.gif') && !src.includes('data:image')) {
                const absoluteUrl = src.startsWith('http') ? src : src.startsWith('//') ? `https:${src}` : new URL(src, baseUrl).href;
                images.push(alt ? `${absoluteUrl} (alt: ${alt})` : absoluteUrl);
            }
        }
        if (images.length > 0) {
            sections.push('=== Product Images Found ===');
            sections.push(images.slice(0, 15).join('\n'));
        }
        return sections.join('\n\n');
    }
    async analyzeUrl(url) {
        if (!url || !/^https?:\/\/.+/i.test(url)) {
            throw new common_1.BadRequestException('A valid URL is required');
        }
        this.logger.log(`→ OpenAI URL Analysis: Fetching ${url}`);
        const start = Date.now();
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                redirect: 'follow',
                signal: AbortSignal.timeout(15000),
            });
            if (!res.ok) {
                throw new common_1.BadRequestException(`Failed to fetch URL (HTTP ${res.status})`);
            }
            const html = await res.text();
            this.logger.log(`  Fetched ${html.length} chars of HTML`);
            const structuredData = this.extractStructuredData(html, url);
            this.logger.log(`  Extracted structured data: ${structuredData.length} chars`);
            const visibleText = html
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 8000);
            const prompt = `You are an inventory asset identification expert. Extract ALL product information from this product page to create an inventory asset entry.

URL: ${url}

${structuredData ? `STRUCTURED DATA (most reliable — use this first):\n${structuredData}\n\n` : ''}VISIBLE PAGE TEXT (backup):\n${visibleText}

Return ONLY a valid JSON object with this exact structure, no markdown, no code blocks, no explanation:
{"name":"Full product name","brand":"Brand/manufacturer name","model":"Model number/name","serialNumber":null,"category":"tool|equipment|furniture|electronics|vehicle_accessory|other","description":"Brief product description (2-3 sentences)","supplier":"Store/website name","purchaseDate":null,"purchasePrice":99.99,"shippingCost":null,"tax":null,"notes":"Specs, dimensions, weight, warranty info, included accessories","condition":"new","imageUrl":"Direct absolute URL to main product image","additionalImageUrls":["url1","url2"]}

CRITICAL RULES:
- name MUST be the full product name (e.g., "Milwaukee M18 FUEL 1/2 in. High Torque Impact Wrench")
- brand MUST be the manufacturer (e.g., "Milwaukee", "DeWalt", "Snap-on")
- purchasePrice MUST be the numeric price (e.g., 299.00), never null if a price is visible
- supplier should be the website/store name derived from the URL domain
- imageUrl MUST be an absolute URL (starting with https://) to the main product image
- category must be exactly one of: tool, equipment, furniture, electronics, vehicle_accessory, other
- All price amounts must be numbers, use null only if truly not found
- DO NOT return null for name, brand, or description — these should always be extractable from a product page`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2048,
                temperature: 0.1,
            });
            const duration = Date.now() - start;
            const raw = response.choices[0]?.message?.content?.trim();
            this.logger.log(`← OpenAI URL Analysis OK (${duration}ms) tokens=${response.usage?.total_tokens}`);
            if (!raw) {
                throw new common_1.InternalServerErrorException('OpenAI returned empty response');
            }
            try {
                const cleaned = raw
                    .replace(/^```(?:json)?\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();
                const result = JSON.parse(cleaned);
                this.logger.log(`  Extracted: name="${result.name}", brand="${result.brand}", price=${result.purchasePrice}`);
                return result;
            }
            catch {
                this.logger.error(`Failed to parse URL analysis response: ${raw}`);
                throw new common_1.InternalServerErrorException('Failed to parse URL analysis response');
            }
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException)
                throw error;
            this.logger.error(`← OpenAI URL Analysis FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to analyze URL');
        }
    }
    async analyzeReceiptItems(mediaIds) {
        const imageUrls = [];
        for (const mediaId of mediaIds) {
            const { url } = await this.mediaService.getSignedUrl(mediaId, 3600);
            imageUrls.push(url);
        }
        const prompt = `You are an expert receipt/invoice parser. Analyze the receipt or invoice image(s) and extract EVERY individual line item as a separate asset entry.

Return ONLY a valid JSON object with this exact structure, no markdown, no code blocks, no explanation:
{"supplier":"Store/vendor name","purchaseDate":"YYYY-MM-DD","tax":0,"shippingCost":0,"items":[{"name":"Item full name/description","brand":"Brand if visible","model":"Model number if visible","category":"tool|equipment|furniture|electronics|vehicle_accessory|other","purchasePrice":0,"quantity":1,"description":"Brief item description"}]}

CRITICAL RULES:
- Extract EVERY individual line item from the receipt as a separate entry in the items array
- Each item must have: name (the product name as printed), purchasePrice (unit price, NOT total if qty > 1), quantity
- supplier: the store/vendor name from the receipt header (e.g., "Home Depot", "Amazon", "Harbor Freight")
- purchaseDate: the transaction date in YYYY-MM-DD format — look for ANY date format and convert
- tax: the total tax amount for the whole receipt as a number
- shippingCost: shipping/delivery fee if present, null otherwise
- category must be one of: tool, equipment, furniture, electronics, vehicle_accessory, other
- brand: extract if visible in the item name (e.g., "Milwaukee", "DeWalt")
- model: extract model number if visible
- DO NOT include subtotals, totals, payment lines, change, or non-product lines as items
- DO NOT combine multiple items into one — each distinct product is its own item
- All prices must be numbers, never strings
- If multiple receipt images are provided, they may be pages of the same receipt — combine all items`;
        this.logger.log(`→ OpenAI Receipt Items Analysis: Analyzing ${imageUrls.length} image(s)`);
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
                max_tokens: 4096,
                temperature: 0.1,
            });
            const duration = Date.now() - start;
            const raw = response.choices[0]?.message?.content?.trim();
            this.logger.log(`← OpenAI Receipt Items OK (${duration}ms) tokens=${response.usage?.total_tokens}`);
            if (!raw) {
                throw new common_1.InternalServerErrorException('OpenAI returned empty response');
            }
            try {
                const cleaned = raw
                    .replace(/^```(?:json)?\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();
                const result = JSON.parse(cleaned);
                this.logger.log(`  Extracted ${result.items?.length || 0} items from receipt`);
                return result;
            }
            catch {
                this.logger.error(`Failed to parse receipt items response: ${raw}`);
                throw new common_1.InternalServerErrorException('Failed to parse receipt analysis response');
            }
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.InternalServerErrorException)
                throw error;
            this.logger.error(`← OpenAI Receipt Items FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to analyze receipt');
        }
    }
    async bulkCreate(tenantId, assets) {
        const results = [];
        for (const dto of assets) {
            if (!dto.assetTag) {
                dto.assetTag = await this.generateAssetTag(tenantId);
            }
            const created = await this.prisma.inventoryAsset.create({
                data: {
                    tenantId,
                    name: dto.name,
                    assetTag: dto.assetTag,
                    serialNumber: dto.serialNumber,
                    description: dto.description,
                    notes: dto.notes,
                    category: dto.category,
                    status: dto.status ?? 'available',
                    condition: dto.condition ?? 'new',
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
            results.push(created);
        }
        return { count: results.length, assets: results };
    }
    async analyzeImages(mediaIds) {
        const imageUrls = [];
        for (const mediaId of mediaIds) {
            const { url } = await this.mediaService.getSignedUrl(mediaId, 3600);
            imageUrls.push(url);
        }
        const prompt = `You are an inventory asset identification expert. Analyze the image(s) of a tool, equipment, or fixed asset and extract as much information as possible.

Return ONLY a valid JSON object with this exact structure, no markdown, no code blocks, no explanation:
{"name":"Product name","brand":"Brand name","model":"Model number","serialNumber":"Serial number if visible","category":"tool|equipment|furniture|electronics|vehicle_accessory|other","description":"Brief description","supplier":"Store/supplier if visible on packaging or receipt","purchaseDate":"YYYY-MM-DD","purchasePrice":0,"shippingCost":0,"tax":0,"notes":"Any additional info like warranty, specs, etc.","condition":"new|good|fair|poor"}

CRITICAL RULES:
- Only include fields where you can identify the information from the image(s)
- For fields you cannot determine, use null
- name should be the product name (e.g., "Milwaukee M18 Impact Wrench")
- brand should be just the brand/manufacturer (e.g., "Milwaukee")
- model should be the model number/name (e.g., "2767-20")
- category must be one of: tool, equipment, furniture, electronics, vehicle_accessory, other
- condition: if the item looks new/in packaging use "new", otherwise estimate

RECEIPT/INVOICE EXTRACTION (very important):
- If this is a receipt, invoice, or order confirmation, ALWAYS extract:
  - purchaseDate: the transaction/order date in YYYY-MM-DD format (e.g., "2025-03-15")
  - purchasePrice: the total or item price as a number
  - tax: the tax amount as a number
  - shippingCost: shipping/delivery fee as a number
  - supplier: the store or vendor name
  - name: the purchased item name(s)
- Look carefully for dates in ANY format (MM/DD/YYYY, DD-MM-YYYY, "March 15, 2025", etc.) and convert to YYYY-MM-DD
- All price amounts must be numbers (not strings), use null if unknown`;
        this.logger.log(`→ OpenAI Asset Analysis: Analyzing ${imageUrls.length} image(s)`);
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
            this.logger.log(`← OpenAI Asset Analysis OK (${duration}ms) tokens=${response.usage?.total_tokens}`);
            if (!raw) {
                throw new common_1.InternalServerErrorException('OpenAI returned empty response');
            }
            try {
                const cleaned = raw
                    .replace(/^```(?:json)?\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();
                return JSON.parse(cleaned);
            }
            catch {
                this.logger.error(`Failed to parse asset analysis response: ${raw}`);
                throw new common_1.InternalServerErrorException('Failed to parse asset analysis response');
            }
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.InternalServerErrorException)
                throw error;
            this.logger.error(`← OpenAI Asset Analysis FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to analyze images');
        }
    }
};
exports.InventoryAssetsService = InventoryAssetsService;
exports.InventoryAssetsService = InventoryAssetsService = InventoryAssetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        media_1.MediaService])
], InventoryAssetsService);
//# sourceMappingURL=inventory-assets.service.js.map