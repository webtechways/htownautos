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
var PartsPricingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartsPricingService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const prisma_1 = require("@htownautos/prisma");
let PartsPricingService = PartsPricingService_1 = class PartsPricingService {
    prisma;
    logger = new common_1.Logger(PartsPricingService_1.name);
    openai;
    constructor(prisma) {
        this.prisma = prisma;
        const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async analyzeParts(auctionListingId) {
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber: BigInt(auctionListingId) },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Auction listing not found');
        }
        const vehicleInfo = [
            listing.year,
            listing.make,
            listing.modelGroup,
            listing.modelDetail,
            listing.trim,
        ]
            .filter(Boolean)
            .join(' ');
        const prompt = `You are an automotive parts pricing expert. Provide current US market prices for the following components for this specific vehicle:

Vehicle: ${vehicleInfo}
VIN: ${listing.vin || 'N/A'}
Engine: ${listing.engine || 'N/A'}
Transmission: ${listing.transmission || 'N/A'}
Drivetrain: ${listing.drive || 'N/A'}
Fuel Type: ${listing.fuelType || 'N/A'}
Cylinders: ${listing.cylinders || 'N/A'}

Provide pricing for these parts (used/aftermarket where applicable):
1. Engine (complete/long block)
2. Transmission (complete)
3. Starter Motor
4. Battery
5. Spark Plugs (full set)
6. Oil Filter
7. Air Filter
8. Fuel Injectors (full set)
9. ECU (Engine Control Unit)
10. BCM (Body Control Module)
11. Engine Mounts (full set)
12. Tires (set of 4, standard replacement)
13. Front Axle/CV Axles
14. Rear Axle
15. Wheel Bearings (set)
16. A/C Compressor
17. Radiator
18. Catalytic Converter
19. Engine Sensors (O2, MAF, MAP - set)

For each part provide:
- part: Part name exactly as listed above
- description: Specific part description for this vehicle (e.g., "2.5L QR25DE Long Block" for Engine)
- priceMin: Lowest realistic market price in USD
- priceMax: Highest realistic market price in USD
- priceAvg: Average market price in USD

Use realistic prices from junkyards, aftermarket suppliers, and online marketplaces for this specific vehicle. Consider the vehicle year and availability.

Return ONLY a valid JSON array, no markdown, no code blocks, no explanation.
Example: [{"part":"Engine","description":"2.5L 4-Cyl QR25DE Long Block","priceMin":800,"priceMax":2500,"priceAvg":1500}]`;
        this.logger.log(`→ OpenAI Parts Pricing API: Fetching prices for ${vehicleInfo} (listing ${auctionListingId})`);
        const start = Date.now();
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 4096,
                temperature: 0.3,
            });
            const duration = Date.now() - start;
            const content = response.choices[0]?.message?.content?.trim();
            this.logger.log(`← OpenAI Parts Pricing API OK (${duration}ms) tokens=${response.usage?.total_tokens}`);
            if (!content) {
                throw new common_1.InternalServerErrorException('OpenAI returned empty response');
            }
            let parts;
            try {
                const cleaned = content
                    .replace(/^```(?:json)?\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();
                parts = JSON.parse(cleaned);
            }
            catch {
                this.logger.error(`Failed to parse parts pricing response: ${content}`);
                throw new common_1.InternalServerErrorException('Failed to parse parts pricing response');
            }
            if (!Array.isArray(parts)) {
                throw new common_1.InternalServerErrorException('Expected array from parts pricing');
            }
            await this.prisma.vehicleMarketPart.deleteMany({
                where: { auctionListingId: BigInt(auctionListingId) },
            });
            await this.prisma.vehicleMarketPart.createMany({
                data: parts.map((p) => ({
                    auctionListingId: BigInt(auctionListingId),
                    part: p.part,
                    description: p.description || null,
                    priceMin: p.priceMin || 0,
                    priceMax: p.priceMax || 0,
                    priceAvg: p.priceAvg || 0,
                    source: 'openai',
                })),
            });
            const saved = await this.prisma.vehicleMarketPart.findMany({
                where: { auctionListingId: BigInt(auctionListingId) },
                orderBy: { createdAt: 'asc' },
            });
            this.logger.log(`Saved ${saved.length} parts prices for listing ${auctionListingId}`);
            return saved;
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`← OpenAI Parts Pricing API FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to fetch parts pricing');
        }
    }
    async getParts(auctionListingId) {
        return this.prisma.vehicleMarketPart.findMany({
            where: { auctionListingId: BigInt(auctionListingId) },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.PartsPricingService = PartsPricingService;
exports.PartsPricingService = PartsPricingService = PartsPricingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], PartsPricingService);
//# sourceMappingURL=parts-pricing.service.js.map