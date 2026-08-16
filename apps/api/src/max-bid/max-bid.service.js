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
var MaxBidService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxBidService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const prisma_1 = require("@htownautos/prisma");
let MaxBidService = MaxBidService_1 = class MaxBidService {
    prisma;
    logger = new common_1.Logger(MaxBidService_1.name);
    openai;
    constructor(prisma) {
        this.prisma = prisma;
        const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async calculateMaxBid(auctionListingId, marketPriceData, compsData) {
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber: BigInt(auctionListingId) },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Auction listing not found');
        }
        const latestAnalysis = await this.prisma.auctionVehicleAnalysis.findFirst({
            where: { auctionListingId: BigInt(auctionListingId) },
            orderBy: { createdAt: 'desc' },
            include: { damages: true },
        });
        const marketParts = await this.prisma.vehicleMarketPart.findMany({
            where: { auctionListingId: BigInt(auctionListingId) },
        });
        const latestCarfax = await this.prisma.carfaxReport.findFirst({
            where: { auctionListingId: BigInt(auctionListingId) },
            orderBy: { createdAt: 'desc' },
        });
        const prompt = this.buildPrompt(listing, marketPriceData, compsData, latestAnalysis, marketParts, latestCarfax);
        this.logger.log(`→ OpenAI Max Bid: Calculating for listing ${auctionListingId}`);
        const start = Date.now();
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 4096,
                temperature: 0.3,
            });
            const duration = Date.now() - start;
            const raw = response.choices[0]?.message?.content?.trim();
            this.logger.log(`← OpenAI Max Bid OK (${duration}ms) tokens=${response.usage?.total_tokens}`);
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
                this.logger.error(`Failed to parse max bid response: ${raw}`);
                throw new common_1.InternalServerErrorException('Failed to parse max bid response');
            }
            if (typeof result.maxBid !== 'number' ||
                typeof result.analysis !== 'string') {
                throw new common_1.InternalServerErrorException('Invalid max bid response structure');
            }
            const saved = await this.prisma.maxBidRecommendation.create({
                data: {
                    auctionListingId: BigInt(auctionListingId),
                    maxBid: result.maxBid,
                    analysis: result.analysis,
                },
            });
            this.logger.log(`Saved max bid recommendation ${saved.id}: $${result.maxBid} for listing ${auctionListingId}`);
            return saved;
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`← OpenAI Max Bid FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to calculate max bid recommendation');
        }
    }
    async getRecommendations(auctionListingId) {
        return this.prisma.maxBidRecommendation.findMany({
            where: { auctionListingId: BigInt(auctionListingId) },
            orderBy: { createdAt: 'desc' },
        });
    }
    buildPrompt(listing, marketPriceData, compsData, damageAnalysis, marketParts, carfaxReport) {
        const vehicleInfo = [
            listing.year,
            listing.make,
            listing.modelGroup,
            listing.modelDetail,
            listing.trim,
        ]
            .filter(Boolean)
            .join(' ');
        const vehicleSection = `VEHICLE: ${vehicleInfo}
VIN: ${listing.vin || 'N/A'}
Odometer: ${listing.odometer || 'N/A'} mi
Engine: ${listing.engine || 'N/A'} | Transmission: ${listing.transmission || 'N/A'} | Drive: ${listing.drive || 'N/A'}
Fuel: ${listing.fuelType || 'N/A'} | Cylinders: ${listing.cylinders || 'N/A'}
Runs/Drives: ${listing.runsDrives || 'N/A'} | Has Keys: ${listing.hasKeys || 'N/A'}
Title: ${listing.saleTitleType || 'N/A'} (${listing.saleTitleState || 'N/A'})
Primary Damage: ${listing.damageDescription || 'None listed'}
Secondary Damage: ${listing.secondaryDamage || 'None listed'}
Location: ${listing.locationCity || ''}, ${listing.locationState || ''} ${listing.locationZip || ''}`;
        const auctionSection = `AUCTION DATA:
Current High Bid: $${listing.highBid || 0}
Buy It Now Price: $${listing.buyItNowPrice || 'N/A'}
Est. Retail Value (Copart): $${listing.estRetailValue || 'N/A'}
Copart Repair Cost Estimate: $${listing.repairCost || 'N/A'}`;
        const marketSection = `MARKET PRICING (MarketCheck):
MarketCheck Price: $${marketPriceData.marketcheckPrice || 'N/A'}
MSRP: $${marketPriceData.msrp || 'N/A'}`;
        const topComps = compsData.listings.slice(0, 20);
        const compsLines = topComps
            .map((c, i) => `  ${i + 1}. ${c.heading || 'Unknown'} — $${c.price || 'N/A'} | ${c.miles || '?'} mi | ${c.sellerType || 'unknown'}`)
            .join('\n');
        const compsSection = `COMPARABLE VEHICLES (${compsData.numFound} found, showing top ${topComps.length}):
${compsLines}`;
        let damageSection = 'DAMAGE ANALYSIS: None available';
        if (damageAnalysis?.damages?.length > 0) {
            const totalRepairCost = damageAnalysis.damages.reduce((sum, d) => sum + Number(d.partCost || 0) + Number(d.laborCost || 0), 0);
            const damageLines = damageAnalysis.damages
                .map((d) => `  - ${d.part} (severity ${d.level}/10): ${d.description || 'No description'} — Parts: $${d.partCost} + Labor: $${d.laborCost}`)
                .join('\n');
            damageSection = `DAMAGE ANALYSIS (AI-detected, total est. repair: $${totalRepairCost.toFixed(0)}):
${damageLines}`;
        }
        let partsSection = 'PARTS MARKET PRICING: None available';
        if (marketParts.length > 0) {
            const totalPartsValue = marketParts.reduce((sum, p) => sum + Number(p.priceAvg || 0), 0);
            const partsLines = marketParts
                .map((p) => `  - ${p.part}: $${p.priceMin}-$${p.priceMax} (avg $${p.priceAvg})`)
                .join('\n');
            partsSection = `PARTS MARKET PRICING (total avg parts value: $${totalPartsValue.toFixed(0)}):
${partsLines}`;
        }
        const CARFAX_TRUNCATION = 6000;
        let carfaxSection = 'CARFAX REPORT: None available';
        if (carfaxReport) {
            const carfaxText = (carfaxReport.aiSummary ?? carfaxReport.analysis ?? '').trim();
            const source = carfaxReport.aiSummary ? 'AI Summary' : 'Stripped Text';
            if (carfaxText) {
                const truncated = carfaxText.length > CARFAX_TRUNCATION
                    ? carfaxText.substring(0, CARFAX_TRUNCATION) + '...[truncated]'
                    : carfaxText;
                carfaxSection = `CARFAX REPORT (${source}):
${truncated}`;
            }
        }
        return `You are an expert auto auction buyer and vehicle valuation analyst. Calculate the maximum realistic bid for this vehicle at auction.

${vehicleSection}

${auctionSection}

${marketSection}

${compsSection}

${damageSection}

${partsSection}

${carfaxSection}

INSTRUCTIONS:
1. Consider the retail market value from MarketCheck and comparable listings
2. Subtract ALL estimated repair costs from the damage analysis
3. Factor in the title type (salvage titles typically sell for 40-60% of clean title value)
4. Consider Carfax history (accidents, title issues, ownership count affect resale)
5. Account for auction fees (typically 10-15% buyer premium) and transport costs ($200-$500)
6. Factor in parts salvage value if the vehicle is better suited for parting out
7. Consider whether the vehicle runs/drives and has keys
8. Apply a profit margin of at least 15-20% for resale viability
9. Compare your calculated bid against the current high bid and buy-it-now price

Return ONLY valid JSON, no markdown, no code blocks:
{"maxBid": <number>, "analysis": "<detailed multi-paragraph explanation of your reasoning, including the math breakdown>"}

The analysis should explain:
- Estimated after-repair retail value
- Total estimated repair costs
- Auction fees and transport costs
- Title discount factor applied
- Profit margin calculation
- Final max bid justification
- Whether buying at this price makes financial sense`;
    }
};
exports.MaxBidService = MaxBidService;
exports.MaxBidService = MaxBidService = MaxBidService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], MaxBidService);
//# sourceMappingURL=max-bid.service.js.map