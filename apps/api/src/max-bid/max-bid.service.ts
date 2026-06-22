import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '@htownautos/prisma';

@Injectable()
export class MaxBidService {
  private readonly logger = new Logger(MaxBidService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
  ) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async calculateMaxBid(
    auctionListingId: string,
    marketPriceData: { marketcheckPrice: number | null; msrp: number | null },
    compsData: { listings: any[]; numFound: number },
  ) {
    const listing = await this.prisma.auctionListing.findUnique({
      where: { lotNumber: BigInt(auctionListingId) },
    });
    if (!listing) {
      throw new NotFoundException('Auction listing not found');
    }

    // Fetch latest damage analysis with damage items
    const latestAnalysis =
      await this.prisma.auctionVehicleAnalysis.findFirst({
        where: { auctionListingId: BigInt(auctionListingId) },
        orderBy: { createdAt: 'desc' },
        include: { damages: true },
      });

    // Fetch market parts
    const marketParts = await this.prisma.vehicleMarketPart.findMany({
      where: { auctionListingId: BigInt(auctionListingId) },
    });

    // Fetch latest carfax report
    const latestCarfax = await this.prisma.carfaxReport.findFirst({
      where: { auctionListingId: BigInt(auctionListingId) },
      orderBy: { createdAt: 'desc' },
    });

    const prompt = this.buildPrompt(
      listing,
      marketPriceData,
      compsData,
      latestAnalysis,
      marketParts,
      latestCarfax,
    );

    this.logger.log(
      `→ OpenAI Max Bid: Calculating for listing ${auctionListingId}`,
    );
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
      this.logger.log(
        `← OpenAI Max Bid OK (${duration}ms) tokens=${response.usage?.total_tokens}`,
      );

      if (!raw) {
        throw new InternalServerErrorException(
          'OpenAI returned empty response',
        );
      }

      let result: { maxBid: number; analysis: string };
      try {
        const cleaned = raw
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        result = JSON.parse(cleaned);
      } catch {
        this.logger.error(`Failed to parse max bid response: ${raw}`);
        throw new InternalServerErrorException(
          'Failed to parse max bid response',
        );
      }

      if (
        typeof result.maxBid !== 'number' ||
        typeof result.analysis !== 'string'
      ) {
        throw new InternalServerErrorException(
          'Invalid max bid response structure',
        );
      }

      const saved = await this.prisma.maxBidRecommendation.create({
        data: {
          auctionListingId: BigInt(auctionListingId),
          maxBid: result.maxBid,
          analysis: result.analysis,
        },
      });

      this.logger.log(
        `Saved max bid recommendation ${saved.id}: $${result.maxBid} for listing ${auctionListingId}`,
      );

      return saved;
    } catch (error) {
      const duration = Date.now() - start;
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error(
        `← OpenAI Max Bid FAILED (${duration}ms): ${error}`,
      );
      throw new InternalServerErrorException(
        'Failed to calculate max bid recommendation',
      );
    }
  }

  async getRecommendations(auctionListingId: string) {
    return this.prisma.maxBidRecommendation.findMany({
      where: { auctionListingId: BigInt(auctionListingId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  private buildPrompt(
    listing: any,
    marketPriceData: any,
    compsData: any,
    damageAnalysis: any,
    marketParts: any[],
    carfaxReport: any,
  ): string {
    const vehicleInfo = [
      listing.year,
      listing.make,
      listing.modelGroup,
      listing.modelDetail,
      listing.trim,
    ]
      .filter(Boolean)
      .join(' ');

    // Section 1: Vehicle Identity
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

    // Section 2: Auction Pricing
    const auctionSection = `AUCTION DATA:
Current High Bid: $${listing.highBid || 0}
Buy It Now Price: $${listing.buyItNowPrice || 'N/A'}
Est. Retail Value (Copart): $${listing.estRetailValue || 'N/A'}
Copart Repair Cost Estimate: $${listing.repairCost || 'N/A'}`;

    // Section 3: Market Prices
    const marketSection = `MARKET PRICING (MarketCheck):
MarketCheck Price: $${marketPriceData.marketcheckPrice || 'N/A'}
MSRP: $${marketPriceData.msrp || 'N/A'}`;

    // Section 4: Comparable Vehicles (top 20 — give the model a broad market picture)
    const topComps = compsData.listings.slice(0, 20);
    const compsLines = topComps
      .map(
        (c: any, i: number) =>
          `  ${i + 1}. ${c.heading || 'Unknown'} — $${c.price || 'N/A'} | ${c.miles || '?'} mi | ${c.sellerType || 'unknown'}`,
      )
      .join('\n');
    const compsSection = `COMPARABLE VEHICLES (${compsData.numFound} found, showing top ${topComps.length}):
${compsLines}`;

    // Section 5: Damage Analysis — ALL detected parts, no cap
    let damageSection = 'DAMAGE ANALYSIS: None available';
    if (damageAnalysis?.damages?.length > 0) {
      const totalRepairCost = damageAnalysis.damages.reduce(
        (sum: number, d: any) =>
          sum + Number(d.partCost || 0) + Number(d.laborCost || 0),
        0,
      );
      const damageLines = damageAnalysis.damages
        .map(
          (d: any) =>
            `  - ${d.part} (severity ${d.level}/10): ${d.description || 'No description'} — Parts: $${d.partCost} + Labor: $${d.laborCost}`,
        )
        .join('\n');
      damageSection = `DAMAGE ANALYSIS (AI-detected, total est. repair: $${totalRepairCost.toFixed(0)}):
${damageLines}`;
    }

    // Section 6: Market Parts Pricing — ALL parts, no cap
    let partsSection = 'PARTS MARKET PRICING: None available';
    if (marketParts.length > 0) {
      const totalPartsValue = marketParts.reduce(
        (sum: number, p: any) => sum + Number(p.priceAvg || 0),
        0,
      );
      const partsLines = marketParts
        .map(
          (p: any) =>
            `  - ${p.part}: $${p.priceMin}-$${p.priceMax} (avg $${p.priceAvg})`,
        )
        .join('\n');
      partsSection = `PARTS MARKET PRICING (total avg parts value: $${totalPartsValue.toFixed(0)}):
${partsLines}`;
    }

    // Section 7: Carfax Report
    // Prefer the structured AI summary when present — it's more signal-dense.
    // Fall back to the raw stripped-HTML analysis. Truncation raised to 6000
    // chars to give the model a full picture of title brand, accidents, and owners.
    const CARFAX_TRUNCATION = 6000;
    let carfaxSection = 'CARFAX REPORT: None available';
    if (carfaxReport) {
      const carfaxText = (carfaxReport.aiSummary ?? carfaxReport.analysis ?? '').trim();
      const source = carfaxReport.aiSummary ? 'AI Summary' : 'Stripped Text';
      if (carfaxText) {
        const truncated =
          carfaxText.length > CARFAX_TRUNCATION
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
}
