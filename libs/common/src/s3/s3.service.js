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
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = require("crypto");
let S3Service = S3Service_1 = class S3Service {
    logger = new common_1.Logger(S3Service_1.name);
    s3Client;
    bucket;
    region;
    cdnBaseUrl;
    constructor() {
        this.region = process.env.AWS_REGION || 'us-east-1';
        this.bucket = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_PUBLIC || '';
        this.cdnBaseUrl = process.env.CDN_BASE_URL?.replace(/\/+$/, '') || null;
        const endpoint = process.env.AWS_S3_ENDPOINT;
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
            ...(endpoint && { endpoint, forcePathStyle: false }),
        });
    }
    buildPublicUrl(key) {
        if (this.cdnBaseUrl) {
            return `${this.cdnBaseUrl}/${key}`;
        }
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }
    generateKey(folder, fileExtension) {
        const uuid = (0, crypto_1.randomUUID)();
        const year = new Date().getFullYear();
        return `${folder}/${year}/${uuid}/original.${fileExtension}`;
    }
    async generatePresignedPutUrl(folder, fileExtension, contentType, isPrivate = false, expiresIn = 300) {
        const key = this.generateKey(folder, fileExtension);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        const publicUrl = this.buildPublicUrl(key);
        this.logger.log(`Presigned PUT URL generated: ${key} (${isPrivate ? 'private' : 'public'})`);
        return { uploadUrl, key, publicUrl };
    }
    async headObject(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            const response = await this.s3Client.send(command);
            return {
                exists: true,
                contentLength: response.ContentLength ?? 0,
                contentType: response.ContentType ?? 'application/octet-stream',
            };
        }
        catch (error) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return { exists: false, contentLength: 0, contentType: '' };
            }
            throw error;
        }
    }
    async uploadFile(file, folder = 'uploads', isPrivate = false) {
        try {
            const fileExtension = file.originalname.split('.').pop() || 'bin';
            const key = this.generateKey(folder, fileExtension);
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });
            await this.s3Client.send(command);
            const url = this.buildPublicUrl(key);
            this.logger.log(`File uploaded successfully: ${key} (${isPrivate ? 'private' : 'public'})`);
            return {
                url,
                key,
                bucket: this.bucket,
                size: file.size,
                mimeType: file.mimetype,
            };
        }
        catch (error) {
            this.logger.error('Error uploading file to S3', error);
            throw error;
        }
    }
    async uploadBuffer(buffer, folder, fileExtension, contentType) {
        try {
            const key = this.generateKey(folder, fileExtension);
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            });
            await this.s3Client.send(command);
            const url = this.buildPublicUrl(key);
            this.logger.log(`Buffer uploaded successfully: ${key}`);
            return {
                url,
                key,
                bucket: this.bucket,
                size: buffer.length,
                mimeType: contentType,
            };
        }
        catch (error) {
            this.logger.error('Error uploading buffer to S3', error);
            throw error;
        }
    }
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            this.logger.log(`File deleted successfully: ${key}`);
        }
        catch (error) {
            this.logger.error('Error deleting file from S3', error);
            throw error;
        }
    }
    async uploadBufferToKey(buffer, key, contentType, acl) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ...(acl && { ACL: acl }),
        });
        await this.s3Client.send(command);
    }
    async uploadFromUrl(url, key, contentType = 'image/jpeg', acl) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ...(acl && { ACL: acl }),
        });
        await this.s3Client.send(command);
    }
    async downloadBuffer(key) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            const response = await this.s3Client.send(command);
            const chunks = [];
            for await (const chunk of response.Body) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        }
        catch (error) {
            this.logger.error(`Error downloading file from S3: ${key}`, error);
            throw error;
        }
    }
    async getSignedUrl(key, expiresIn = 3600, options) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
                ...(options?.contentType
                    ? { ResponseContentType: options.contentType }
                    : {}),
                ...(options?.disposition
                    ? { ResponseContentDisposition: options.disposition }
                    : {}),
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            return url;
        }
        catch (error) {
            this.logger.error('Error generating signed URL', error);
            throw error;
        }
    }
    async signAttachmentsOnRecords(records, expiresIn = 3600) {
        if (!records?.length)
            return;
        const tasks = [];
        for (const rec of records) {
            if (!Array.isArray(rec?.attachments))
                continue;
            for (const att of rec.attachments) {
                if (!att || typeof att !== 'object' || !att.key)
                    continue;
                tasks.push(this.getSignedUrl(att.key, expiresIn)
                    .then((signed) => {
                    att.url = signed;
                })
                    .catch(() => {
                    att.url = '';
                }));
            }
        }
        await Promise.all(tasks);
    }
    async initMultipartUpload(key, contentType) {
        const command = new client_s3_1.CreateMultipartUploadCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        const response = await this.s3Client.send(command);
        if (!response.UploadId) {
            throw new Error('S3 did not return an UploadId for multipart init');
        }
        this.logger.log(`Multipart upload started: ${key} (uploadId=${response.UploadId})`);
        return { uploadId: response.UploadId };
    }
    async presignUploadPart(key, uploadId, partNumber, expiresIn = 3600) {
        const command = new client_s3_1.UploadPartCommand({
            Bucket: this.bucket,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    async completeMultipartUpload(key, uploadId, parts) {
        if (!parts.length) {
            throw new Error('completeMultipartUpload called with empty parts array');
        }
        const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber);
        const command = new client_s3_1.CompleteMultipartUploadCommand({
            Bucket: this.bucket,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: sorted.map((p) => ({ ETag: p.etag, PartNumber: p.partNumber })),
            },
        });
        await this.s3Client.send(command);
        this.logger.log(`Multipart upload completed: ${key} (${sorted.length} parts)`);
    }
    async abortMultipartUpload(key, uploadId) {
        try {
            const command = new client_s3_1.AbortMultipartUploadCommand({
                Bucket: this.bucket,
                Key: key,
                UploadId: uploadId,
            });
            await this.s3Client.send(command);
            this.logger.log(`Multipart upload aborted: ${key} (uploadId=${uploadId})`);
        }
        catch (error) {
            if (error?.name === 'NoSuchUpload' ||
                error?.$metadata?.httpStatusCode === 404) {
                this.logger.log(`Multipart upload already gone: ${key}`);
                return;
            }
            throw error;
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
//# sourceMappingURL=s3.service.js.map