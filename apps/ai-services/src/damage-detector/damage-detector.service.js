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
var DamageDetectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DamageDetectorService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const prisma_1 = require("@htownautos/prisma");
let DamageDetectorService = DamageDetectorService_1 = class DamageDetectorService {
    prisma;
    logger = new common_1.Logger(DamageDetectorService_1.name);
    openai;
    constructor(prisma) {
        this.prisma = prisma;
        const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured - Damage Detector will not work');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async analyzeImages(auctionListingId, imageUrls) {
        if (!imageUrls.length) {
            throw new common_1.BadRequestException('At least one image URL is required');
        }
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber: BigInt(auctionListingId) },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Auction listing not found');
        }
        const selectedImages = imageUrls.slice(0, 10);
        const imageContent = selectedImages.map((url) => ({
            type: 'image_url',
            image_url: { url, detail: 'high' },
        }));
        const vehicleDetails = [];
        if (listing.damageDescription)
            vehicleDetails.push(`Primary Damage: ${listing.damageDescription}`);
        if (listing.secondaryDamage)
            vehicleDetails.push(`Secondary Damage: ${listing.secondaryDamage}`);
        if (listing.hasKeys)
            vehicleDetails.push(`Has Keys: ${listing.hasKeys}`);
        if (listing.odometer)
            vehicleDetails.push(`Odometer: ${listing.odometer} mi`);
        if (listing.drive)
            vehicleDetails.push(`Drivetrain: ${listing.drive}`);
        if (listing.transmission)
            vehicleDetails.push(`Transmission: ${listing.transmission}`);
        if (listing.fuelType)
            vehicleDetails.push(`Fuel Type: ${listing.fuelType}`);
        if (listing.cylinders)
            vehicleDetails.push(`Cylinders: ${listing.cylinders}`);
        if (listing.runsDrives)
            vehicleDetails.push(`Runs/Drives: ${listing.runsDrives}`);
        if (listing.specialNote)
            vehicleDetails.push(`Special Note: ${listing.specialNote}`);
        const prompt = `You are an automotive damage assessment expert specializing in auction vehicles. Analyze these vehicle images carefully and identify ALL visible damages.

Vehicle: ${listing.year || ''} ${listing.make || ''} ${listing.modelGroup || ''} ${listing.modelDetail || ''} ${listing.trim || ''}
${vehicleDetails.length > 0 ? vehicleDetails.join('\n') : ''}

Use the vehicle details above to make a more accurate damage and cost assessment. For example, if Runs/Drives is "No" or the vehicle has high mileage, factor that into your analysis. If there are special notes, consider them for hidden damages.

IMPORTANT: Also check dashboard/instrument cluster images for warning lights. If any warning lights are illuminated (Check Engine, ABS, Airbag, Oil Pressure, Battery, Transmission, TPMS, etc.), report each one as a separate damage item. For warning lights, use the part name format "Dashboard - [Light Name]" (e.g., "Dashboard - Check Engine Light", "Dashboard - ABS Warning"). Estimate the diagnostic and repair cost associated with each warning light.

AIRBAGS: Carefully check for deployed airbags. Look for:
- Visually deployed airbags: steering wheel airbag popped open, side curtain airbags hanging, passenger dash airbag deployed, knee airbags visible
- Dashboard airbag warning light (SRS light) illuminated on the instrument cluster
- Missing airbag covers or torn panels indicating prior deployment
Report each deployed airbag separately (e.g., "Airbag - Driver Frontal", "Airbag - Passenger Frontal", "Airbag - Left Side Curtain"). Include the cost of the airbag module, the SRS sensor, and the clockspring if the steering wheel airbag deployed. Also identify any potentially affected sensors (impact sensors, occupant sensors, seatbelt pretensioners) based on the collision damage pattern.

For each damage found, provide:
- part: The specific vehicle part damaged (e.g., "Front Bumper", "Hood", "Left Fender", "Windshield", "Dashboard - Check Engine Light", "Airbag - Driver Frontal")
- description: Brief description of the damage visible in the images
- level: Severity from 1-10 (1=minor cosmetic scratch, 3=moderate dent, 5=significant damage needing repair, 7=major structural damage, 10=completely destroyed/missing)
- partCost: Estimated cost in USD for the replacement part or repair (use realistic market prices)
- laborCost: Estimated labor cost in USD for repair/replacement/diagnostic (use realistic shop rates)

Also provide an overall damage assessment:
- damagePercent: An integer 0-100 estimating the vehicle's TOTAL damage severity (0 = pristine, 33 = light/cosmetic, 66 = moderate structural, 100 = severe/total loss). Weigh the number, severity (level) and location of damages, warning lights and deployed airbags.

Return ONLY a valid JSON object, no markdown, no code blocks, no explanation, with this exact shape:
{"damagePercent": 45, "damages": [{"part":"Front Bumper","description":"Deep crack on lower section with paint peeling","level":6,"partCost":350.00,"laborCost":200.00},{"part":"Dashboard - Check Engine Light","description":"Check engine warning light illuminated on instrument cluster","level":5,"partCost":200.00,"laborCost":150.00}]}

If no damages are visible, return: {"damagePercent": 0, "damages": []}`;
        this.logger.log(`→ OpenAI Vision API: Analyzing ${selectedImages.length} images for listing ${auctionListingId}`);
        const start = Date.now();
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [{ type: 'text', text: prompt }, ...imageContent],
                    },
                ],
                max_tokens: 4096,
                temperature: 0.3,
            });
            const duration = Date.now() - start;
            const content = response.choices[0]?.message?.content?.trim();
            this.logger.log(`← OpenAI Vision API OK (${duration}ms) tokens=${response.usage?.total_tokens}`);
            this.logger.log(`← OpenAI Vision raw response: ${content}`);
            if (!content) {
                throw new common_1.InternalServerErrorException('OpenAI returned empty response');
            }
            let damages;
            let damagePercent = null;
            try {
                const cleaned = content
                    .replace(/^```(?:json)?\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();
                const parsed = JSON.parse(cleaned);
                if (Array.isArray(parsed)) {
                    damages = parsed;
                }
                else {
                    damages = Array.isArray(parsed.damages) ? parsed.damages : [];
                    if (typeof parsed.damagePercent === 'number') {
                        damagePercent = Math.min(100, Math.max(0, Math.round(parsed.damagePercent)));
                    }
                }
            }
            catch {
                this.logger.error(`Failed to parse OpenAI response as JSON: ${content}`);
                throw new common_1.InternalServerErrorException('Failed to parse damage analysis response');
            }
            if (!Array.isArray(damages)) {
                throw new common_1.InternalServerErrorException('Expected array from damage analysis');
            }
            if (damagePercent === null) {
                const maxLevel = damages.reduce((m, d) => Math.max(m, Number(d.level) || 0), 0);
                damagePercent = Math.min(100, Math.round(maxLevel * 10));
            }
            const analysis = await this.prisma.$transaction(async (tx) => {
                const created = await tx.auctionVehicleAnalysis.create({
                    data: {
                        auctionListingId: BigInt(auctionListingId),
                        damagePercent,
                    },
                });
                if (damages.length > 0) {
                    await tx.damageAi.createMany({
                        data: damages.map((d) => ({
                            auctionVehicleAnalysisId: created.id,
                            part: d.part,
                            description: d.description || null,
                            level: Math.min(10, Math.max(1, Math.round(d.level))),
                            partCost: d.partCost || 0,
                            laborCost: d.laborCost || 0,
                        })),
                    });
                }
                return tx.auctionVehicleAnalysis.findUnique({
                    where: { id: created.id },
                    include: {
                        damages: {
                            include: { partsPrices: true },
                        },
                    },
                });
            });
            this.logger.log(`Saved analysis ${analysis.id} with ${damages.length} damages for listing ${auctionListingId}`);
            return analysis;
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`← OpenAI Vision API FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to analyze images for damage detection');
        }
    }
    async getDamagePercents(ids) {
        const lotNumbers = ids
            .map((id) => {
            try {
                return BigInt(id);
            }
            catch {
                return null;
            }
        })
            .filter((v) => v !== null);
        if (lotNumbers.length === 0)
            return {};
        const rows = await this.prisma.auctionVehicleAnalysis.findMany({
            where: { auctionListingId: { in: lotNumbers }, damagePercent: { not: null } },
            select: { auctionListingId: true, damagePercent: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        const out = {};
        for (const r of rows) {
            const key = r.auctionListingId.toString();
            if (!(key in out) && r.damagePercent !== null)
                out[key] = r.damagePercent;
        }
        return out;
    }
    async getAnalyses(auctionListingId) {
        const analyses = await this.prisma.auctionVehicleAnalysis.findMany({
            where: { auctionListingId: BigInt(auctionListingId) },
            include: {
                damages: {
                    include: { partsPrices: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return analyses;
    }
};
exports.DamageDetectorService = DamageDetectorService;
exports.DamageDetectorService = DamageDetectorService = DamageDetectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], DamageDetectorService);
//# sourceMappingURL=damage-detector.service.js.map