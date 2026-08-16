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
var CarfaxAnalyzerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarfaxAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const CARFAX_BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://panel.cheapcarfax.net/',
};
let CarfaxAnalyzerService = CarfaxAnalyzerService_1 = class CarfaxAnalyzerService {
    prisma;
    s3Service;
    logger = new common_1.Logger(CarfaxAnalyzerService_1.name);
    openai;
    constructor(prisma, s3Service) {
        this.prisma = prisma;
        this.s3Service = s3Service;
        const apiKey = process.env.OPENAI_API_KEY || process.env.TTS_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY / TTS_API_KEY not configured');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async uploadReport(auctionListingId, s3Key) {
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber: BigInt(auctionListingId) },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Auction listing not found');
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
    async analyzeReport(reportId) {
        const report = await this.prisma.carfaxReport.findUnique({
            where: { id: reportId },
            include: { auctionListing: true },
        });
        if (!report) {
            throw new common_1.NotFoundException('Carfax report not found');
        }
        const listing = report.auctionListing;
        this.logger.log(`Downloading PDF from S3: ${report.s3Key}`);
        let pdfBase64;
        try {
            const pdfBuffer = await this.s3Service.downloadBuffer(report.s3Key);
            pdfBase64 = pdfBuffer.toString('base64');
            this.logger.log(`PDF downloaded (${pdfBuffer.length} bytes)`);
        }
        catch (error) {
            this.logger.error(`Failed to download PDF from S3: ${error}`);
            throw new common_1.InternalServerErrorException('Failed to download PDF from S3');
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
        this.logger.log(`→ OpenAI Carfax Analysis: Analyzing report for ${vehicleInfo} (report ${reportId})`);
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
            this.logger.log(`← OpenAI Carfax Analysis OK (${duration}ms) tokens=${response.usage?.total_tokens}`);
            if (!content) {
                throw new common_1.InternalServerErrorException('OpenAI returned empty response');
            }
            const updated = await this.prisma.carfaxReport.update({
                where: { id: reportId },
                data: { analysis: content },
            });
            this.logger.log(`Carfax analysis saved for report ${reportId}`);
            return updated;
        }
        catch (error) {
            const duration = Date.now() - start;
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error(`← OpenAI Carfax Analysis FAILED (${duration}ms): ${error}`);
            throw new common_1.InternalServerErrorException('Failed to analyze Carfax report');
        }
    }
    async summarizeReport(reportId) {
        const report = await this.prisma.carfaxReport.findUnique({
            where: { id: reportId },
            include: { auctionListing: true },
        });
        if (!report) {
            throw new common_1.NotFoundException('Carfax report not found');
        }
        const MIN_ANALYSIS_CHARS = 200;
        let textToSummarize = null;
        if (report.analysis && report.analysis.length >= MIN_ANALYSIS_CHARS) {
            textToSummarize = report.analysis;
            this.logger.log(`summarizeReport ${reportId}: using existing analysis (${textToSummarize.length} chars)`);
        }
        else {
            this.logger.log(`summarizeReport ${reportId}: downloading from S3 (${report.s3Key})`);
            let rawBuffer;
            try {
                rawBuffer = await this.s3Service.downloadBuffer(report.s3Key);
            }
            catch (err) {
                throw new common_1.InternalServerErrorException(`Failed to download S3 object: ${err.message}`);
            }
            const sniff = rawBuffer.slice(0, 5).toString('ascii');
            const isPdf = sniff.startsWith('%PDF');
            if (isPdf) {
                this.logger.log(`summarizeReport ${reportId}: PDF detected, running analyzeReport first`);
                const analyzed = await this.analyzeReport(reportId);
                textToSummarize = analyzed.analysis ?? null;
            }
            else {
                const html = rawBuffer.toString('utf8');
                textToSummarize = html
                    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                this.logger.log(`summarizeReport ${reportId}: HTML detected, stripped to ${textToSummarize.length} chars`);
            }
        }
        if (!textToSummarize || textToSummarize.length < MIN_ANALYSIS_CHARS) {
            throw new common_1.BadRequestException('Insufficient Carfax content to summarize');
        }
        const listing = report.auctionListing;
        const vehicleInfo = [listing.year, listing.make, listing.modelGroup, listing.modelDetail, listing.trim]
            .filter(Boolean)
            .join(' ');
        const MAX_INPUT_CHARS = 18000;
        const truncatedText = textToSummarize.length > MAX_INPUT_CHARS
            ? textToSummarize.slice(0, MAX_INPUT_CHARS) + '\n...[content truncated]'
            : textToSummarize;
        const systemPrompt = `You are an automotive history report analyst. You summarize vehicle history reports in clear, structured plain text in English. Be concise but complete. Use section headers in ALL CAPS followed by a colon. Do not use markdown or bullet symbols.`;
        const userPrompt = `Summarize the following Carfax report for a ${vehicleInfo} (VIN: ${listing.vin ?? 'N/A'}).

Produce a clean structured plain-text summary (no markdown) with these sections:
ACCIDENT/DAMAGE HISTORY: (every reported incident, severity, date if known)
TITLE BRAND: (clean, salvage, rebuilt, flood, lemon, etc.)
ODOMETER/ROLLBACK FLAGS: (mileage progression, any red flags)
NUMBER OF OWNERS: (count, types: personal/fleet/rental/lease)
SERVICE RECORDS: (documented services, gaps, regularity)
RECALLS/OPEN CAMPAIGNS: (list any open recalls)
LEMON/BUYBACK: (yes/no with details)
RISK NOTE: (2-3 sentences summarizing key risks or confidence for purchase)

--- CARFAX REPORT TEXT ---
${truncatedText}`;
        this.logger.log(`→ OpenAI Carfax Summary: summarizing report ${reportId} for ${vehicleInfo}`);
        const start = Date.now();
        let summaryText;
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 1500,
                temperature: 0.2,
            });
            const duration = Date.now() - start;
            summaryText = response.choices[0]?.message?.content?.trim() ?? '';
            this.logger.log(`← OpenAI Carfax Summary OK (${duration}ms) tokens=${response.usage?.total_tokens}`);
            if (!summaryText) {
                throw new common_1.InternalServerErrorException('OpenAI returned empty summary');
            }
        }
        catch (err) {
            const duration = Date.now() - start;
            if (err instanceof common_1.NotFoundException || err instanceof common_1.InternalServerErrorException || err instanceof common_1.BadRequestException) {
                throw err;
            }
            this.logger.error(`← OpenAI Carfax Summary FAILED (${duration}ms): ${err}`);
            throw new common_1.InternalServerErrorException('Failed to generate Carfax AI summary');
        }
        const updated = await this.prisma.carfaxReport.update({
            where: { id: reportId },
            data: { aiSummary: summaryText },
        });
        this.logger.log(`Carfax AI summary saved for report ${reportId}`);
        return updated;
    }
    async getReports(auctionListingId) {
        const reports = await this.prisma.carfaxReport.findMany({
            where: { auctionListingId: BigInt(auctionListingId) },
            orderBy: { createdAt: 'desc' },
        });
        return reports;
    }
    async getReportsByVehicle(params) {
        const orClauses = [];
        if (params.vin)
            orClauses.push({ vin: params.vin });
        if (params.lotNumber) {
            try {
                orClauses.push({ auctionListingId: BigInt(params.lotNumber) });
            }
            catch {
            }
        }
        if (!orClauses.length)
            return [];
        return this.prisma.carfaxReport.findMany({
            where: { OR: orClauses },
            orderBy: { createdAt: 'desc' },
        });
    }
    async batchCheckHasReports(auctionListingIds) {
        if (auctionListingIds.length === 0)
            return [];
        const bigIntIds = auctionListingIds.map((id) => BigInt(id));
        const results = await this.prisma.carfaxReport.findMany({
            where: { auctionListingId: { in: bigIntIds } },
            select: { auctionListingId: true },
            distinct: ['auctionListingId'],
        });
        return results.map((r) => r.auctionListingId.toString());
    }
    async getAllListingIdsWithReports() {
        const results = await this.prisma.carfaxReport.findMany({
            select: { auctionListingId: true },
            distinct: ['auctionListingId'],
        });
        return results.map((r) => r.auctionListingId.toString());
    }
    async getProviderLimits() {
        const apiKey = process.env.CARFAX_API ?? '';
        if (!apiKey) {
            return {
                daily_limit: null,
                carfax_reports_left_today: null,
                autocheck_reports_left_today: null,
                credits: null,
            };
        }
        try {
            const res = await fetch('https://panel.cheapcarfax.net/api/user/limits', {
                headers: { 'x-api-key': apiKey, ...CARFAX_BROWSER_HEADERS },
            });
            if (!res.ok) {
                this.logger.warn(`Carfax limits fetch failed: ${res.status}`);
                return {
                    daily_limit: null,
                    carfax_reports_left_today: null,
                    autocheck_reports_left_today: null,
                    credits: null,
                };
            }
            const j = (await res.json());
            return {
                daily_limit: j.daily_limit ?? null,
                carfax_reports_left_today: j.carfax_reports_left_today ?? null,
                autocheck_reports_left_today: j.autocheck_reports_left_today ?? null,
                credits: j.credits ?? null,
            };
        }
        catch (err) {
            this.logger.warn(`Carfax limits fetch error: ${err.message}`);
            return {
                daily_limit: null,
                carfax_reports_left_today: null,
                autocheck_reports_left_today: null,
                credits: null,
            };
        }
    }
    async fetchCarfaxFromProvider(auctionListingId) {
        const apiKey = process.env.CARFAX_API ?? '';
        if (!apiKey) {
            throw new common_1.InternalServerErrorException('CARFAX_API no configurada');
        }
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber: BigInt(auctionListingId) },
            select: { lotNumber: true, vin: true },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Auction listing not found');
        }
        const rawVin = listing.vin?.replace(/\s/g, '') ?? '';
        if (!rawVin || rawVin.length !== 17) {
            throw new common_1.BadRequestException('VIN no disponible o inválido para este lote');
        }
        const vin = rawVin;
        this.logger.log(`Fetching Carfax from provider for VIN ${vin} (listing ${auctionListingId})`);
        const url = `https://panel.cheapcarfax.net/api/carfax/vin/${vin}/html`;
        let providerRes;
        let bodyText = '';
        let wasHtmlBlock = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            providerRes = await fetch(url, {
                headers: { 'x-api-key': apiKey, ...CARFAX_BROWSER_HEADERS },
            });
            const contentType = providerRes.headers.get('content-type') ?? '';
            bodyText = await providerRes.text().catch(() => '');
            wasHtmlBlock =
                contentType.includes('text/html') ||
                    /^\s*<(?:!doctype|html)/i.test(bodyText) ||
                    /cloudflare|attention required|cf-ray|ie6 oldie/i.test(bodyText.slice(0, 400));
            if (providerRes.ok && !wasHtmlBlock)
                break;
            if (wasHtmlBlock && attempt < 3) {
                this.logger.warn(`Carfax provider returned an HTML/Cloudflare block (attempt ${attempt}/3); retrying`);
                await new Promise((r) => setTimeout(r, 1500 * attempt));
                continue;
            }
            break;
        }
        if (!providerRes.ok || wasHtmlBlock) {
            if (wasHtmlBlock) {
                this.logger.error(`Carfax provider Cloudflare block for VIN ${vin} (status ${providerRes.status})`);
                throw new common_1.BadRequestException('El proveedor de Carfax bloqueó temporalmente la solicitud (protección Cloudflare del lado de CheapCarfax). Reintenta en unos minutos.');
            }
            let providerMsg = '';
            try {
                providerMsg = (JSON.parse(bodyText)?.message ?? '').toString();
            }
            catch {
                providerMsg = bodyText;
            }
            const lower = providerMsg.toLowerCase();
            if (providerRes.status === 402 || lower.includes('credit')) {
                throw new common_1.BadRequestException('Sin créditos de Carfax. Recarga en panel.cheapcarfax.net/buy-credits');
            }
            if (providerRes.status === 429 || lower.includes('limit')) {
                throw new common_1.BadRequestException('Límite diario de Carfax alcanzado');
            }
            const cleanMsg = providerMsg.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            throw new common_1.BadRequestException(cleanMsg
                ? `Carfax: ${cleanMsg.slice(0, 160)}`
                : `Carfax provider error ${providerRes.status}`);
        }
        const payload = JSON.parse(bodyText);
        const { yearMakeModel, id: providerId, html } = payload;
        const safeProviderId = providerId.replace(/[^A-Za-z0-9_-]/g, '_');
        const s3Key = `carfax/${auctionListingId}-${safeProviderId}.html`;
        await this.s3Service.uploadBufferToKey(Buffer.from(html, 'utf8'), s3Key, 'text/html');
        this.logger.log(`Carfax HTML uploaded to S3: ${s3Key}`);
        const MAX_ANALYSIS_CHARS = 12000;
        const stripped = html
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const summary = `${yearMakeModel}\n\n${stripped}`.slice(0, MAX_ANALYSIS_CHARS);
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
        const signedUrl = await this.s3Service.getSignedUrl(s3Key, 3600);
        return {
            ...report,
            auctionListingId: report.auctionListingId.toString(),
            signedUrl,
            yearMakeModel,
            contentType: 'text/html',
        };
    }
};
exports.CarfaxAnalyzerService = CarfaxAnalyzerService;
exports.CarfaxAnalyzerService = CarfaxAnalyzerService = CarfaxAnalyzerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        common_2.S3Service])
], CarfaxAnalyzerService);
//# sourceMappingURL=carfax-analyzer.service.js.map