import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../media/s3.service';

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

  async analyzeReport(auctionListingId: string, s3Key: string) {
    const listing = await this.prisma.auctionListing.findUnique({
      where: { lotNumber: BigInt(auctionListingId) },
    });
    if (!listing) {
      throw new NotFoundException('Auction listing not found');
    }

    // Download PDF from S3 and convert to base64 for OpenAI
    this.logger.log(`Downloading PDF from S3: ${s3Key}`);
    let pdfBase64: string;
    try {
      const pdfBuffer = await this.s3Service.downloadBuffer(s3Key);
      pdfBase64 = pdfBuffer.toString('base64');
      this.logger.log(`PDF downloaded (${pdfBuffer.length} bytes), sending as base64`);
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
      `→ OpenAI Carfax Analysis: Analyzing report for ${vehicleInfo} (listing ${auctionListingId})`,
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

      const report = await this.prisma.carfaxReport.create({
        data: {
          auctionListingId: BigInt(auctionListingId),
          s3Key,
          analysis: content,
        },
      });

      this.logger.log(
        `Saved Carfax report ${report.id} for listing ${auctionListingId}`,
      );

      return report;
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
    return this.prisma.carfaxReport.findMany({
      where: { auctionListingId: BigInt(auctionListingId) },
      orderBy: { createdAt: 'desc' },
    });
  }
}
