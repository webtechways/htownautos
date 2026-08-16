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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const common_2 = require("@htownautos/common");
const swagger_1 = require("@nestjs/swagger");
const media_service_1 = require("./media.service");
const create_media_dto_1 = require("./dto/create-media.dto");
const update_media_dto_1 = require("./dto/update-media.dto");
const query_media_dto_1 = require("./dto/query-media.dto");
const presign_media_dto_1 = require("./dto/presign-media.dto");
const confirm_media_dto_1 = require("./dto/confirm-media.dto");
const init_multipart_dto_1 = require("./dto/init-multipart.dto");
const complete_multipart_dto_1 = require("./dto/complete-multipart.dto");
const abort_multipart_dto_1 = require("./dto/abort-multipart.dto");
const media_entity_1 = require("./entities/media.entity");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async upload(file, createMediaDto) {
        return this.mediaService.uploadAndCreate(file, createMediaDto);
    }
    async presign(dto) {
        return this.mediaService.presign(dto);
    }
    async confirm(dto) {
        return this.mediaService.confirmUpload(dto);
    }
    async multipartInit(dto) {
        return this.mediaService.initMultipart(dto);
    }
    async multipartComplete(dto) {
        return this.mediaService.completeMultipart(dto);
    }
    async multipartAbort(dto) {
        return this.mediaService.abortMultipart(dto);
    }
    async findAll(query) {
        return this.mediaService.findAll(query);
    }
    async findOne(id) {
        return this.mediaService.findOne(id);
    }
    async getSignedUrl(id, expiresIn) {
        return this.mediaService.getSignedUrl(id, expiresIn);
    }
    async update(id, updateMediaDto) {
        return this.mediaService.update(id, updateMediaDto);
    }
    async remove(id) {
        return this.mediaService.remove(id);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_2.AuditLog)({
        action: 'create',
        resource: 'media',
        level: 'medium',
        pii: false,
        compliance: ['dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload a file and create media record',
        description: `
      Uploads a file to AWS S3 and creates a media record in the database with automatic privacy control.

      **Privacy System:**
      - Files associated with a buyer (buyerId provided) are ALWAYS private, regardless of isPublic setting
      - Private files are stored in S3 with ACL 'private' and can only be accessed via signed URLs
      - Public files are stored with ACL 'public-read' and accessible directly via URL

      **File Organization in S3:**
      - Buyer files: buyers/{buyerId}/2024/filename.ext (always private)
      - Vehicle files: vehicles/{vehicleId}/2024/filename.ext (can be public or private)
      - General files: uploads/2024/filename.ext (can be public or private)

      **Use Cases:**
      1. Public vehicle photos for inventory display (vehicleId + isPublic=true)
      2. Private buyer documents like ID, receipts (buyerId - automatically private)
      3. Internal documents not yet associated with entities (no associations)
    `,
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['file', 'mediaType'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload (multipart/form-data)',
                },
                mediaType: {
                    type: 'string',
                    enum: ['image', 'video', 'document'],
                    description: 'Type of media being uploaded',
                },
                category: {
                    type: 'string',
                    enum: ['exterior', 'interior', 'engine', 'document', 'receipt', 'title', 'other'],
                    description: 'Category classification for organizing media',
                },
                title: {
                    type: 'string',
                    description: 'Title of the media (e.g., "Front View", "Driver License")',
                    example: 'Front bumper damage photo',
                },
                description: {
                    type: 'string',
                    description: 'Detailed description of the media content',
                    example: 'Shows scratches on the front bumper from minor accident',
                },
                alt: {
                    type: 'string',
                    description: 'Alt text for accessibility (recommended for images)',
                    example: '2020 Honda Accord front bumper with visible scratches',
                },
                vehicleId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Vehicle UUID to associate media with. Use for vehicle photos, inspection images, etc.',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
                buyerId: {
                    type: 'string',
                    format: 'uuid',
                    description: `
            Buyer UUID to associate media with (for private buyer documents).
            **IMPORTANT:** When buyerId is provided, the file is AUTOMATICALLY private in both database and S3.
            The isPublic setting is ignored. Use for: driver licenses, receipts, contracts, personal documents.
          `,
                    example: '987fcdeb-51a2-43b7-b456-123456789abc',
                },
                isPublic: {
                    type: 'boolean',
                    description: `
            Whether the media should be publicly accessible.
            - true: File stored with public-read ACL in S3, accessible via direct URL
            - false: File stored with private ACL, requires signed URL for access
            **NOTE:** This setting is IGNORED if buyerId is provided (buyer files are always private)
          `,
                    default: true,
                    example: true,
                },
            },
        },
        examples: {
            'public-vehicle-photo': {
                summary: 'Public Vehicle Photo (Inventory)',
                description: 'Upload a public vehicle photo for website display. File will be accessible via direct URL.',
                value: {
                    file: '(binary)',
                    mediaType: 'image',
                    category: 'exterior',
                    title: 'Front view',
                    description: '2020 Honda Accord front exterior view',
                    alt: '2020 Honda Accord silver front view',
                    vehicleId: '123e4567-e89b-12d3-a456-426614174000',
                    isPublic: true,
                },
            },
            'private-buyer-document': {
                summary: 'Private Buyer Document (Sensitive)',
                description: 'Upload a private buyer document. File is AUTOMATICALLY private, stored in buyers/ folder, requires signed URL.',
                value: {
                    file: '(binary)',
                    mediaType: 'document',
                    category: 'document',
                    title: 'Driver License',
                    description: 'Copy of buyer driver license for verification',
                    buyerId: '987fcdeb-51a2-43b7-b456-123456789abc',
                    isPublic: false,
                },
            },
            'private-vehicle-damage': {
                summary: 'Private Vehicle Damage Photo (Internal)',
                description: 'Upload a private vehicle photo for internal records only. Not visible on public site.',
                value: {
                    file: '(binary)',
                    mediaType: 'image',
                    category: 'other',
                    title: 'Pre-purchase damage documentation',
                    description: 'Existing scratches documented before purchase',
                    vehicleId: '123e4567-e89b-12d3-a456-426614174000',
                    isPublic: false,
                },
            },
            'buyer-receipt': {
                summary: 'Private Buyer Receipt (Financial)',
                description: 'Upload buyer receipt or payment proof. Always private, organized in buyer-specific folder.',
                value: {
                    file: '(binary)',
                    mediaType: 'document',
                    category: 'receipt',
                    title: 'Down payment receipt',
                    description: 'Receipt for $5,000 down payment on 2020 Honda Accord',
                    buyerId: '987fcdeb-51a2-43b7-b456-123456789abc',
                    vehicleId: '123e4567-e89b-12d3-a456-426614174000',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'File uploaded and media record created successfully',
        type: media_entity_1.MediaEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                filename: 'vehicle-front.jpg',
                url: 'https://htownautos-media.s3.us-east-1.amazonaws.com/vehicles/123e4567-e89b-12d3-a456-426614174000/2024/abc123-def456.jpg',
                path: 'vehicles/123e4567-e89b-12d3-a456-426614174000/2024/abc123-def456.jpg',
                mimeType: 'image/jpeg',
                size: 1024000,
                mediaType: 'image',
                category: 'exterior',
                title: 'Front view',
                description: '2020 Honda Accord front exterior view',
                alt: '2020 Honda Accord silver front view',
                storageProvider: 's3',
                storageBucket: 'htownautos-media',
                storageKey: 'vehicles/123e4567-e89b-12d3-a456-426614174000/2024/abc123-def456.jpg',
                isPublic: true,
                isActive: true,
                vehicleId: '123e4567-e89b-12d3-a456-426614174000',
                buyerId: null,
                createdAt: '2024-01-12T10:30:00.000Z',
                updatedAt: '2024-01-12T10:30:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or no file provided',
        schema: {
            example: {
                statusCode: 400,
                message: 'No file provided',
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vehicle or Buyer not found (when IDs are provided)',
        schema: {
            example: {
                statusCode: 404,
                message: 'Vehicle with ID 123e4567-e89b-12d3-a456-426614174000 not found',
                error: 'Not Found',
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
            new common_1.FileTypeValidator({
                fileType: /^(image\/(jpeg|png|webp|gif)|application\/pdf|video\/(mp4|quicktime))$/,
            }),
        ],
    }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_media_dto_1.CreateMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('presign'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate a presigned PUT URL for direct client-to-S3 upload',
        description: 'Returns a presigned URL the client uses to PUT the file directly to S3. ' +
            'After uploading, call POST /media/confirm with the returned key to create the DB record.',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Presigned URL generated' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Vehicle or Buyer not found' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [presign_media_dto_1.PresignMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "presign", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, common_2.AuditLog)({
        action: 'create',
        resource: 'media',
        level: 'medium',
        pii: false,
        compliance: ['dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm a presigned upload and create the media record',
        description: 'Verifies the file exists in S3 via HeadObject, validates size/type, then creates the media DB record. ' +
            'Call this after the client has successfully PUT the file using the presigned URL.',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Media record created', type: media_entity_1.MediaEntity }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'File not found in S3 or exceeds size limit' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Vehicle or Buyer not found' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_media_dto_1.ConfirmMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)('multipart/init'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Start an S3 multipart upload (videos / large files)',
        description: 'Returns an uploadId, an S3 key and a list of presigned PUT URLs — one per part. ' +
            'The browser uploads each part directly to S3 in parallel, then calls /media/multipart/complete ' +
            'with the ETags S3 returned. On failure, call /media/multipart/abort to discard the parts.',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Multipart session created' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid contentType or fileSize' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Vehicle / Buyer / Part not found' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [init_multipart_dto_1.InitMultipartDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "multipartInit", null);
__decorate([
    (0, common_1.Post)('multipart/complete'),
    (0, common_2.AuditLog)({
        action: 'create',
        resource: 'media',
        level: 'medium',
        pii: false,
        compliance: ['dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete a multipart upload and create the media record',
        description: 'Tells S3 to reassemble the parts into the final object, verifies the object exists, ' +
            'then creates the Media DB record with the same FK wiring as /media/confirm.',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Media record created', type: media_entity_1.MediaEntity }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Multipart completion failed or object missing in S3' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Vehicle / Buyer / Part not found' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [complete_multipart_dto_1.CompleteMultipartDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "multipartComplete", null);
__decorate([
    (0, common_1.Post)('multipart/abort'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Abort an in-flight multipart upload',
        description: 'Discards all uploaded parts so they stop accruing storage cost. Idempotent — safe to call ' +
            'after a partial failure or when the user cancels mid-upload.',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Multipart upload aborted' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [abort_multipart_dto_1.AbortMultipartDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "multipartAbort", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'media',
        level: 'low',
        pii: false,
        compliance: ['dealertrack'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all media with pagination and filters',
        description: `
      Retrieves a paginated list of media files with optional filters.

      **Filtering:**
      - Filter by vehicleId to get all media for a specific vehicle (public photos, inspection images, etc.)
      - Filter by buyerId to get all private documents for a specific buyer (requires authentication)
      - Filter by mediaType (image, video, document) to get specific file types
      - Filter by category (exterior, interior, engine, document, receipt, title, other)
      - Filter by isActive status to exclude soft-deleted media

      **Pagination:**
      - Default: page=1, limit=10
      - Maximum limit: 100 items per page
      - Response includes metadata: total count, total pages, hasNextPage, hasPreviousPage

      **Use Cases:**
      - Get all public vehicle photos for inventory display
      - Retrieve buyer-specific documents for deal processing
      - List all receipts for accounting
      - Find all inactive/archived media
    `,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number starting from 1',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page (1-100)',
        example: 10,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'vehicleId',
        required: false,
        type: String,
        description: 'Filter by vehicle UUID. Returns all media associated with this vehicle (photos, documents, etc.)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'buyerId',
        required: false,
        type: String,
        description: 'Filter by buyer UUID. Returns all PRIVATE media associated with this buyer (ID, receipts, contracts). Requires authentication.',
        example: '987fcdeb-51a2-43b7-b456-123456789abc',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'mediaType',
        required: false,
        enum: ['image', 'video', 'document'],
        description: 'Filter by media type. Use "image" for photos, "video" for videos, "document" for PDFs/docs',
        example: 'image',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'category',
        required: false,
        enum: ['exterior', 'interior', 'engine', 'document', 'receipt', 'title', 'other'],
        description: 'Filter by category. Useful for organizing and displaying specific types of media',
        example: 'exterior',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isActive',
        required: false,
        type: Boolean,
        description: 'Filter by active status. Use false to retrieve archived/deleted media',
        example: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully retrieved media files with pagination metadata',
        schema: {
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        filename: 'vehicle-front.jpg',
                        url: 'https://htownautos-media.s3.us-east-1.amazonaws.com/vehicles/123e4567/2024/abc123.jpg',
                        mediaType: 'image',
                        category: 'exterior',
                        title: 'Front view',
                        isPublic: true,
                        vehicleId: '123e4567-e89b-12d3-a456-426614174000',
                        buyerId: null,
                        createdAt: '2024-01-12T10:30:00.000Z',
                    },
                    {
                        id: '987fcdeb-51a2-43b7-b456-123456789abc',
                        filename: 'driver-license.pdf',
                        url: 'https://htownautos-media.s3.us-east-1.amazonaws.com/buyers/987fcdeb/2024/xyz789.pdf',
                        mediaType: 'document',
                        category: 'document',
                        title: 'Driver License',
                        isPublic: false,
                        vehicleId: null,
                        buyerId: '987fcdeb-51a2-43b7-b456-123456789abc',
                        createdAt: '2024-01-12T09:15:00.000Z',
                    },
                ],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_media_dto_1.QueryMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_2.AuditLog)({
        action: 'read',
        resource: 'media',
        level: 'medium',
        pii: true,
        compliance: ['dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a media file by ID',
        description: `
      Retrieves a single media file by its UUID with complete metadata.

      **Important Notes:**
      - This endpoint returns the media RECORD, not the actual file content
      - For public media: Use the returned 'url' field to access the file directly
      - For private media (isPublic=false): Use the signed URL endpoint to get temporary access
      - The 'url' field for private media points to S3 but requires signed URL for access

      **Use Cases:**
      - Get media metadata before displaying
      - Check media privacy status (isPublic field)
      - Retrieve storage information (bucket, key, provider)
      - Verify media associations (vehicleId, buyerId)
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Media UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Media file found',
        type: media_entity_1.MediaEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                filename: 'vehicle-front.jpg',
                url: 'https://htownautos-media.s3.us-east-1.amazonaws.com/vehicles/123e4567/2024/abc123.jpg',
                path: 'vehicles/123e4567/2024/abc123.jpg',
                mimeType: 'image/jpeg',
                size: 1024000,
                width: 1920,
                height: 1080,
                mediaType: 'image',
                category: 'exterior',
                title: 'Front view',
                description: '2020 Honda Accord front exterior view',
                alt: '2020 Honda Accord silver front view',
                storageProvider: 's3',
                storageBucket: 'htownautos-media',
                storageKey: 'vehicles/123e4567/2024/abc123.jpg',
                isPublic: true,
                isActive: true,
                vehicleId: '123e4567-e89b-12d3-a456-426614174000',
                buyerId: null,
                createdAt: '2024-01-12T10:30:00.000Z',
                updatedAt: '2024-01-12T10:30:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Media file not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Media with ID 123e4567-e89b-12d3-a456-426614174000 not found',
                error: 'Not Found',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/signed-url'),
    (0, common_2.AuditLog)({
        action: 'access',
        resource: 'media',
        level: 'high',
        pii: true,
        compliance: ['dealertrack', 'glba'],
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a signed URL for private media',
        description: `
      Generates a temporary signed URL for accessing private media files securely.

      **How It Works:**
      - For PUBLIC media (isPublic=true): Returns the direct S3 URL (no signature needed)
      - For PRIVATE media (isPublic=false): Generates a pre-signed URL with temporary access
      - Signed URLs expire after the specified time (default: 3600 seconds / 1 hour)
      - After expiration, the URL becomes invalid and a new one must be generated

      **When to Use:**
      - Accessing buyer documents (driver licenses, receipts, contracts)
      - Viewing private vehicle inspection photos
      - Generating temporary download links for internal documents
      - Sharing private files with authorized users for limited time

      **Security Notes:**
      - Signed URLs grant temporary access without authentication
      - Do not share signed URLs publicly or embed in public pages
      - URLs are time-limited and automatically expire
      - Each request generates a unique signed URL

      **Example Flow:**
      1. Frontend requests signed URL from this endpoint
      2. Backend validates access and generates signed URL
      3. Frontend uses signed URL to display/download file
      4. URL automatically expires after specified time
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Media UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'expiresIn',
        required: false,
        type: Number,
        description: `
      URL expiration time in seconds (default: 3600 = 1 hour).

      Common values:
      - 300 = 5 minutes (short-term access)
      - 900 = 15 minutes (quick review)
      - 3600 = 1 hour (default, typical use)
      - 86400 = 24 hours (extended access)

      Choose based on security requirements:
      - Shorter for highly sensitive documents
      - Longer for user convenience
    `,
        example: 3600,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Signed URL generated successfully',
        schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'Temporary signed URL for accessing the private media file',
                },
            },
            examples: {
                'private-media-signed-url': {
                    summary: 'Private Media Signed URL',
                    description: 'Generated signed URL for a private buyer document with signature and expiration',
                    value: {
                        url: 'https://htownautos-media.s3.us-east-1.amazonaws.com/buyers/987fcdeb/2024/xyz789.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240112T103000Z&X-Amz-Expires=3600&X-Amz-Signature=abcdef123456...',
                    },
                },
                'public-media-direct-url': {
                    summary: 'Public Media Direct URL',
                    description: 'For public media, returns the direct URL without signature',
                    value: {
                        url: 'https://htownautos-media.s3.us-east-1.amazonaws.com/vehicles/123e4567/2024/abc123.jpg',
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Media file not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Media with ID 123e4567-e89b-12d3-a456-426614174000 not found',
                error: 'Not Found',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Media does not have a storage key',
        schema: {
            example: {
                statusCode: 400,
                message: 'Media does not have a storage key',
                error: 'Bad Request',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('expiresIn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getSignedUrl", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_2.AuditLog)({
        action: 'update',
        resource: 'media',
        level: 'medium',
        pii: false,
        compliance: ['dealertrack', 'glba'],
        trackChanges: true,
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a media record',
        description: `
      Updates metadata of an existing media record. The actual file in S3 cannot be updated.

      **What Can Be Updated:**
      - Metadata: title, description, alt text
      - Category classification
      - Associations: vehicleId, buyerId
      - Public/private status (with restrictions)

      **Privacy Enforcement on Update:**
      - If buyerId exists (old or new), isPublic is ALWAYS forced to false
      - Cannot make buyer-associated media public
      - Can change public vehicle media to private
      - Can change private media to public ONLY if no buyerId exists

      **Important Notes:**
      - Updating the file itself requires deleting and re-uploading
      - Changing buyerId does NOT move the file in S3 (file stays in original location)
      - isActive can be used for soft-deletion (set to false to "archive")
      - All changes preserve the original file URL and storage location

      **Use Cases:**
      - Fix typos in title/description
      - Recategorize media (exterior → interior)
      - Associate media with different vehicle/buyer
      - Change privacy status (if not buyer-related)
      - Soft-delete media (isActive = false)
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Media UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Media record successfully updated',
        type: media_entity_1.MediaEntity,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                filename: 'vehicle-front.jpg',
                url: 'https://htownautos-media.s3.us-east-1.amazonaws.com/vehicles/123e4567/2024/abc123.jpg',
                mediaType: 'image',
                category: 'exterior',
                title: 'Updated Title - Front Damage',
                description: 'Updated description showing pre-existing damage',
                isPublic: false,
                vehicleId: '123e4567-e89b-12d3-a456-426614174000',
                updatedAt: '2024-01-12T14:45:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
        schema: {
            example: {
                statusCode: 400,
                message: ['title must be a string', 'category must be a valid enum value'],
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Media file, Vehicle, or Buyer not found',
        schema: {
            examples: {
                'media-not-found': {
                    summary: 'Media Not Found',
                    value: {
                        statusCode: 404,
                        message: 'Media with ID 123e4567-e89b-12d3-a456-426614174000 not found',
                        error: 'Not Found',
                    },
                },
                'vehicle-not-found': {
                    summary: 'Vehicle Not Found (when updating vehicleId)',
                    value: {
                        statusCode: 404,
                        message: 'Vehicle with ID 123e4567-e89b-12d3-a456-426614174000 not found',
                        error: 'Not Found',
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_media_dto_1.UpdateMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_2.AuditLog)({
        action: 'delete',
        resource: 'media',
        level: 'high',
        pii: false,
        compliance: ['dealertrack', 'glba'],
        trackChanges: true,
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a media file',
        description: `
      Permanently deletes a media file from both AWS S3 storage and the database.

      **Deletion Process:**
      1. Retrieves media record from database
      2. Deletes the actual file from S3 using storageKey
      3. Deletes the database record
      4. Returns confirmation message

      **Important Notes:**
      - This is a PERMANENT deletion - cannot be undone
      - If S3 deletion fails, database deletion still proceeds (logged as error)
      - Consider soft-delete (isActive = false) instead for important records
      - Deletion cascades: foreign key constraints are honored

      **When to Use:**
      - Remove duplicate uploads
      - Delete incorrectly uploaded files
      - Comply with data deletion requests
      - Clean up old/unused media

      **Alternative (Soft Delete):**
      - Use PATCH endpoint with isActive = false
      - Keeps file in S3 and database but marks as inactive
      - Allows recovery if needed
      - Use isActive filter in GET to exclude from normal queries
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Media UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Media file successfully deleted from both S3 and database',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Confirmation message with the deleted media ID',
                },
            },
            example: {
                message: 'Media with ID 123e4567-e89b-12d3-a456-426614174000 has been successfully deleted',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Media file not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Media with ID 123e4567-e89b-12d3-a456-426614174000 not found',
                error: 'Not Found',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "remove", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map