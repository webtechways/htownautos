import { CarfaxAnalyzerService } from './carfax-analyzer.service';
import { S3Service } from '@htownautos/common';
declare class UploadCarfaxDto {
    auctionListingId: string;
    s3Key: string;
}
declare class FetchCarfaxDto {
    auctionListingId: string;
}
export declare class CarfaxAnalyzerController {
    private readonly carfaxAnalyzerService;
    private readonly s3Service;
    constructor(carfaxAnalyzerService: CarfaxAnalyzerService, s3Service: S3Service);
    fetchFromProvider(dto: FetchCarfaxDto): Promise<{
        data: {
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
        };
    }>;
    upload(dto: UploadCarfaxDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            aiSummary: string | null;
            auctionListingId: bigint;
            s3Key: string;
            analysis: string | null;
            date: Date | null;
        };
    }>;
    analyze(reportId: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            aiSummary: string | null;
            auctionListingId: bigint;
            s3Key: string;
            analysis: string | null;
            date: Date | null;
        };
    }>;
    summarize(reportId: string): Promise<{
        data: {
            id: string;
            aiSummary: string | null;
        };
    }>;
    getDownloadUrl(key: string, expiresIn?: string): Promise<{
        url: string;
    }>;
    getLimits(): Promise<{
        data: {
            daily_limit: number | null;
            carfax_reports_left_today: number | null;
            autocheck_reports_left_today: number | null;
            credits: number | null;
        };
    }>;
    batchCheck(body: {
        ids: string[];
    }): Promise<{
        data: string[];
    }>;
    getByVehicle(vin?: string, lotNumber?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            aiSummary: string | null;
            auctionListingId: bigint;
            s3Key: string;
            analysis: string | null;
            date: Date | null;
        }[];
    }>;
    getReports(auctionListingId: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            aiSummary: string | null;
            auctionListingId: bigint;
            s3Key: string;
            analysis: string | null;
            date: Date | null;
        }[];
    }>;
}
export {};
