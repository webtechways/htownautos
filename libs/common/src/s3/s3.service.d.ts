import { type ObjectCannedACL } from '@aws-sdk/client-s3';
export interface UploadResult {
    url: string;
    key: string;
    bucket: string;
    size: number;
    mimeType: string;
}
export interface PresignResult {
    uploadUrl: string;
    key: string;
    publicUrl: string;
}
export interface HeadObjectResult {
    exists: boolean;
    contentLength: number;
    contentType: string;
}
export declare class S3Service {
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    private readonly region;
    private readonly cdnBaseUrl;
    constructor();
    buildPublicUrl(key: string): string;
    generateKey(folder: string, fileExtension: string): string;
    generatePresignedPutUrl(folder: string, fileExtension: string, contentType: string, isPrivate?: boolean, expiresIn?: number): Promise<PresignResult>;
    headObject(key: string): Promise<HeadObjectResult>;
    uploadFile(file: Express.Multer.File, folder?: string, isPrivate?: boolean): Promise<UploadResult>;
    uploadBuffer(buffer: Buffer, folder: string, fileExtension: string, contentType: string): Promise<UploadResult>;
    deleteFile(key: string): Promise<void>;
    uploadBufferToKey(buffer: Buffer, key: string, contentType: string, acl?: ObjectCannedACL): Promise<void>;
    uploadFromUrl(url: string, key: string, contentType?: string, acl?: ObjectCannedACL): Promise<void>;
    downloadBuffer(key: string): Promise<Buffer>;
    getSignedUrl(key: string, expiresIn?: number, options?: {
        contentType?: string;
        disposition?: 'inline' | 'attachment';
    }): Promise<string>;
    signAttachmentsOnRecords(records: any[], expiresIn?: number): Promise<void>;
    initMultipartUpload(key: string, contentType: string): Promise<{
        uploadId: string;
    }>;
    presignUploadPart(key: string, uploadId: string, partNumber: number, expiresIn?: number): Promise<string>;
    completeMultipartUpload(key: string, uploadId: string, parts: {
        partNumber: number;
        etag: string;
    }[]): Promise<void>;
    abortMultipartUpload(key: string, uploadId: string): Promise<void>;
}
