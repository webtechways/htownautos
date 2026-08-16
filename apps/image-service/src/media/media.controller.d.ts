import { MediaService } from './media.service';
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
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    upload(file: Express.Multer.File, createMediaDto: CreateMediaDto): Promise<MediaEntity>;
    presign(dto: PresignMediaDto): Promise<{
        uploadUrl: string;
        key: string;
        publicUrl: string;
    }>;
    confirm(dto: ConfirmMediaDto): Promise<MediaEntity>;
    multipartInit(dto: InitMultipartDto): Promise<{
        uploadId: string;
        key: string;
        partUrls: {
            partNumber: number;
            url: string;
        }[];
        partSize: number;
        partCount: number;
    }>;
    multipartComplete(dto: CompleteMultipartDto): Promise<MediaEntity>;
    multipartAbort(dto: AbortMultipartDto): Promise<{
        aborted: true;
    }>;
    findAll(query: QueryMediaDto): Promise<PaginatedResponseDto<MediaEntity>>;
    findOne(id: string): Promise<MediaEntity>;
    getSignedUrl(id: string, expiresIn?: number): Promise<{
        url: string;
    }>;
    update(id: string, updateMediaDto: UpdateMediaDto): Promise<MediaEntity>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
