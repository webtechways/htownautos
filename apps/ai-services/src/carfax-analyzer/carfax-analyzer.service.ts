import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';

@Injectable()
export class CarfaxAnalyzerService {
  private readonly logger = new Logger(CarfaxAnalyzerService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /** Step 1: Create CarfaxReport record (PDF already uploaded to S3) */
  async uploadReport(auctionListingId: string, s3Key: string) {
    const listing = await this.prisma.auctionListing.findUnique({
      where: { lotNumber: BigInt(auctionListingId) },
    });
    if (!listing) {
      throw new NotFoundException('Auction listing not found');
    }

    const report = await this.prisma.carfaxReport.create({
      data: {
        auctionListingId: BigInt(auctionListingId),
        s3Key,
        vin: listing.vin ?? undefined,
      },
    });

    this.logger.log(`Carfax PDF saved: report ${report.id} for listing ${auctionListingId}`);
    return report;
  }

  /** Step 2: Run AI analysis on an existing report */
  async analyzeReport(reportId: string) {
    const report = await this.prisma.carfaxReport.findUnique({
      where: { id: reportId },
      include: { auctionListing: true },
    });
    if (!report) {
      throw new NotFoundException('Carfax report not found');
    }

    const listing = report.auctionListing;

    // Download PDF from S3
    this.logger.log(`Downloading PDF from S3: ${report.s3Key}`);
    let pdfBase64: string;
    try {
      const pdfBuffer = await this.s3Service.downloadBuffer(report.s3Key);
      pdfBase64 = pdfBuffer.toString('base64');
      this.logger.log(`PDF downloaded (${pdfBuffer.length} bytes)`);
    } catch (error) {
      this.logger.error(`Failed to download PDF from S3: ${error}`);
      throw new InternalServerErrorException('Failed to download PDF from S3');
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

    const prompt = `You are an automotive history and vehicle report expert. Analyze this Carfax PDF report in full detail.

Vehicle: ${vehicleInfo}
VIN: ${listing.vin || 'N/A'}

Provide a comprehensive plain text analysis covering:
1. OWNERSHIP HISTORY: Number of owners, duration of each ownership, type of use (personal, fleet, rental, lease)
2. ACCIDENT & DAMAGE HISTORY: Every reported accident, severity, affected areas, airbag deployment
3. SERVICE & MAINTENANCE RECORDS: All documented services, regularity, any gaps in maintenance
4. TITLE HISTORY: Title type changes, salvage/rebuilt/flood titles, state transfers
5. ODOMETER READINGS: Mileage progression over time, any rollback red flags or inconsistencies
6. RECALLS: Open and completed recalls
7. STRUCTURAL DAMAGE: Any reported structural or frame damage
8. FLOOD/FIRE DAMAGE: Any water or fire damage history
9. LEMON/BUYBACK: Whether the vehicle was ever a lemon law buyback
10. RED FLAGS & WARNINGS: Anything suspicious or concerning

Be thorough and specific. Include dates and mileage where available. This is a plain text report — no markdown, no formatting, just clean text with clear section headers.`;

    this.logger.log(
      `→ OpenAI Carfax Analysis: Analyzing report for ${vehicleInfo} (report ${reportId})`,
    );
    const start = Date.now();

    try {
      const response = await this.openai.responses.create({
        model: 'gpt-4o',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_file',
                filename: 'carfax-report.pdf',
                file_data: `data:application/pdf;base64,${pdfBase64}`,
              },
              {
                type: 'input_text',
                text: prompt,
              },
            ],
          },
        ],
        max_output_tokens: 4096,
        temperature: 0.3,
      });

      const duration = Date.now() - start;
      const content = response.output_text?.trim();
      this.logger.log(
        `← OpenAI Carfax Analysis OK (${duration}ms) tokens=${response.usage?.total_tokens}`,
      );

      if (!content) {
        throw new InternalServerErrorException('OpenAI returned empty response');
      }

      const updated = await this.prisma.carfaxReport.update({
        where: { id: reportId },
        data: { analysis: content },
      });

      this.logger.log(`Carfax analysis saved for report ${reportId}`);
      return updated;
    } catch (error) {
      const duration = Date.now() - start;
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error(`← OpenAI Carfax Analysis FAILED (${duration}ms): ${error}`);
      throw new InternalServerErrorException('Failed to analyze Carfax report');
    }
  }

  async getReports(auctionListingId: string) {
    const reports = await this.prisma.carfaxReport.findMany({
      where: { auctionListingId: BigInt(auctionListingId) },
      orderBy: { createdAt: 'desc' },
    });
    return reports;
  }

  /**
   * Find every Carfax report tied to a vehicle, regardless of which UI
   * created it. A car can be identified by VIN, by lot number, or both —
   * we return the union so the inspection detail page (which has both)
   * surfaces a carfax uploaded earlier from /auction/:id or /vehicles.
   */
  async getReportsByVehicle(params: { vin?: string | null; lotNumber?: string | null }) {
    const orClauses: any[] = [];
    if (params.vin) orClauses.push({ vin: params.vin });
    if (params.lotNumber) {
      try {
        orClauses.push({ auctionListingId: BigInt(params.lotNumber) });
      } catch {
        // Non-numeric lot number — skip; VIN lookup may still match.
      }
    }
    if (!orClauses.length) return [];
    return this.prisma.carfaxReport.findMany({
      where: { OR: orClauses },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Batch check which auction listing IDs have at least one CarfaxReport */
  async batchCheckHasReports(auctionListingIds: string[]): Promise<string[]> {
    if (auctionListingIds.length === 0) return [];

    const bigIntIds = auctionListingIds.map((id) => BigInt(id));
    const results = await this.prisma.carfaxReport.findMany({
      where: { auctionListingId: { in: bigIntIds } },
      select: { auctionListingId: true },
      distinct: ['auctionListingId'],
    });

    return results.map((r) => r.auctionListingId.toString());
  }

  /** Get all auction listing IDs that have carfax reports */
  async getAllListingIdsWithReports(): Promise<string[]> {
    const results = await this.prisma.carfaxReport.findMany({
      select: { auctionListingId: true },
      distinct: ['auctionListingId'],
    });
    return results.map((r) => r.auctionListingId.toString());
  }

  /**
   * Fetch a Carfax HTML report directly from the CheapCarfax provider,
   * store the HTML in S3, persist a CarfaxReport record, and return a
   * signed download URL.
   *
   * Consumes 1 credit per call. The caller must ensure the listing exists
   * and belongs to the correct context before calling this method.
   */
  async fetchCarfaxFromProvider(auctionListingId: string) {
    // 1. Guard: CARFAX_API key must be configured
    const apiKey = process.env.CARFAX_API ?? '';
    if (!apiKey) {
      throw new InternalServerErrorException('CARFAX_API no configurada');
    }

    // 2. Load the AuctionListing and extract VIN
    const listing = await this.prisma.auctionListing.findUnique({
      where: { lotNumber: BigInt(auctionListingId) },
      select: { lotNumber: true, vin: true },
    });
    if (!listing) {
      throw new NotFoundException('Auction listing not found');
    }

    const rawVin = listing.vin?.replace(/\s/g, '') ?? '';
    if (!rawVin || rawVin.length !== 17) {
      throw new BadRequestException('VIN no disponible o inválido para este lote');
    }
    const vin = rawVin;

    // 3. Call CheapCarfax provider
    this.logger.log(`Fetching Carfax from provider for VIN ${vin} (listing ${auctionListingId})`);
    const providerRes = await fetch(
      `https://panel.cheapcarfax.net/api/carfax/vin/${vin}/html`,
      { headers: { 'x-api-key': apiKey } },
    );

    if (!providerRes.ok) {
      const bodyText = await providerRes.text().catch(() => '');
      // The provider returns its message in a JSON { message } body and does NOT
      // always use the matching HTTP status (e.g. "Insufficient credits" comes
      // back as 400), so inspect the message text, not just the status code.
      let providerMsg = '';
      try {
        providerMsg = (JSON.parse(bodyText)?.message ?? '').toString();
      } catch {
        providerMsg = bodyText;
      }
      const lower = providerMsg.toLowerCase();
      if (providerRes.status === 402 || lower.includes('credit')) {
        throw new BadRequestException(
          'Sin créditos de Carfax. Recarga en panel.cheapcarfax.net/buy-credits',
        );
      }
      if (providerRes.status === 429 || lower.includes('limit')) {
        throw new BadRequestException('Límite diario de Carfax alcanzado');
      }
      throw new BadRequestException(
        providerMsg
          ? `Carfax: ${providerMsg.slice(0, 200)}`
          : `Carfax provider error ${providerRes.status}`,
      );
    }

    const payload = (await providerRes.json()) as {
      yearMakeModel: string;
      id: string;
      html: string;
    };
    const { yearMakeModel, id: providerId, html } = payload;

    // 4. Upload HTML to S3 — sanitize providerId to safe chars
    const safeProviderId = providerId.replace(/[^A-Za-z0-9_-]/g, '_');
    const s3Key = `carfax/${auctionListingId}-${safeProviderId}.html`;

    await this.s3Service.uploadBufferToKey(
      Buffer.from(html, 'utf8'),
      s3Key,
      'text/html',
    );
    this.logger.log(`Carfax HTML uploaded to S3: ${s3Key}`);

    // 5. Build plain-text summary for the `analysis` column (used by max-bid)
    const MAX_ANALYSIS_CHARS = 12000;
    const stripped = html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const summary = `${yearMakeModel}\n\n${stripped}`.slice(0, MAX_ANALYSIS_CHARS);

    // 6. Persist CarfaxReport
    const report = await this.prisma.carfaxReport.create({
      data: {
        auctionListingId: BigInt(auctionListingId),
        vin,
        s3Key,
        analysis: summary,
        date: new Date(),
      },
    });
    this.logger.log(`CarfaxReport created: ${report.id} for listing ${auctionListingId}`);

    // 7. Return serialized record + signed URL
    const signedUrl = await this.s3Service.getSignedUrl(s3Key, 3600);

    return {
      ...report,
      auctionListingId: report.auctionListingId.toString(),
      signedUrl,
      yearMakeModel,
      contentType: 'text/html' as const,
    };
  }
}
