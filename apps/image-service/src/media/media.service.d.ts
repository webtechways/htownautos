import { PrismaService } from '@htownautos/prisma';
import { S3Service, PresignResult } from '@htownautos/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { PresignMediaDto } from './dto/presign-media.dto';
import { ConfirmMediaDto } from './dto/confirm-media.dto';
import { InitMultipartDto } from './dto/init-multipart.dto';
import { CompleteMultipartDto } from './dto/complete-multipart.dto';
import { AbortMultipartDto } from './dto/abort-multipart.dto';
import { MediaEntity } from './entities/media.entity';
import { PaginatedResponseDto } from '@htownautos/common';
export declare class MediaService {
    private readonly prisma;
    private readonly s3Service;
    private readonly logger;
    constructor(prisma: PrismaService, s3Service: S3Service);
    private readonly IMAGE_MIMES;
    private readonly MAX_DIMENSION;
    private readonly JPEG_QUALITY;
    private readonly WEBP_QUALITY;
    private optimizeImage;
    uploadAndCreate(file: Express.Multer.File, createMediaDto: CreateMediaDto): Promise<MediaEntity>;
    presign(dto: PresignMediaDto): Promise<PresignResult>;
    confirmUpload(dto: ConfirmMediaDto): Promise<MediaEntity>;
    private readonly MULTIPART_PART_SIZE;
    private readonly MULTIPART_MAX_PARTS;
    private folderForDto;
    initMultipart(dto: InitMultipartDto): Promise<{
        uploadId: string;
        key: string;
        partUrls: {
            partNumber: number;
            url: string;
        }[];
        partSize: number;
        partCount: number;
    }>;
    completeMultipart(dto: CompleteMultipartDto): Promise<MediaEntity>;
    abortMultipart(dto: AbortMultipartDto): Promise<{
        aborted: true;
    }>;
    findAll(query: QueryMediaDto): Promise<PaginatedResponseDto<MediaEntity>>;
    findOne(id: string): Promise<MediaEntity>;
    update(id: string, updateMediaDto: UpdateMediaDto): Promise<MediaEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getSignedUrl(id: string, expiresIn?: number): Promise<{
        url: string;
    }>;
}
