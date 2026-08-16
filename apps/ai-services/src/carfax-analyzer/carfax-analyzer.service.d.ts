import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
export declare class CarfaxAnalyzerService {
    private readonly prisma;
    private readonly s3Service;
    private readonly logger;
    private readonly openai;
    constructor(prisma: PrismaService, s3Service: S3Service);
    uploadReport(auctionListingId: string, s3Key: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vin: string | null;
        aiSummary: string | null;
        auctionListingId: bigint;
        s3Key: string;
        analysis: string | null;
        date: Date | null;
    }>;
    analyzeReport(reportId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vin: string | null;
        aiSummary: string | null;
        auctionListingId: bigint;
        s3Key: string;
        analysis: string | null;
        date: Date | null;
    }>;
    summarizeReport(reportId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vin: string | null;
        aiSummary: string | null;
        auctionListingId: bigint;
        s3Key: string;
        analysis: string | null;
        date: Date | null;
    }>;
    getReports(auctionListingId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vin: string | null;
        aiSummary: string | null;
        auctionListingId: bigint;
        s3Key: string;
        analysis: string | null;
        date: Date | null;
    }[]>;
    getReportsByVehicle(params: {
        vin?: string | null;
        lotNumber?: string | null;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vin: string | null;
        aiSummary: string | null;
        auctionListingId: bigint;
        s3Key: string;
        analysis: string | null;
        date: Date | null;
    }[]>;
    batchCheckHasReports(auctionListingIds: string[]): Promise<string[]>;
    getAllListingIdsWithReports(): Promise<string[]>;
    getProviderLimits(): Promise<{
        daily_limit: number | null;
        carfax_reports_left_today: number | null;
        autocheck_reports_left_today: number | null;
        credits: number | null;
    }>;
    fetchCarfaxFromProvider(auctionListingId: string): Promise<{
        auctionListingId: string;
        signedUrl: string;
        yearMakeModel: string;
        contentType: "text/html";
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vin: string | null;
        aiSummary: string | null;
        s3Key: string;
        analysis: string | null;
        date: Date | null;
    }>;
}
