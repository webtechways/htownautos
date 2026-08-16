import { PrismaService } from '@htownautos/prisma';
import { MediaService } from '@htownautos/media';
import { CreateUploadSessionDto } from './dto/create-upload-session.dto';
import { PresignMediaDto } from '@htownautos/media';
import { ConfirmMediaDto } from '@htownautos/media';
import { MediaEntity } from '@htownautos/media';
export declare class UploadSessionService {
    private prisma;
    private mediaService;
    private readonly logger;
    constructor(prisma: PrismaService, mediaService: MediaService);
    create(dto: CreateUploadSessionDto, userId: string, tenantId?: string): Promise<{
        token: string;
        expiresAt: Date;
    }>;
    validate(token: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        entityType: string;
        entityId: string;
        userId: string;
        mediaType: string;
        category: string | null;
        isPublic: boolean;
        expiresAt: Date;
        token: string;
        used: boolean;
        closed: boolean;
    }>;
    getPublicInfo(token: string): Promise<{
        entityType: string;
        mediaType: string;
        category: string | null;
        isPublic: boolean;
        expiresAt: Date;
    }>;
    presign(token: string, dto: PresignMediaDto): Promise<any>;
    confirm(token: string, dto: ConfirmMediaDto): Promise<MediaEntity>;
    getSessionMedia(token: string): Promise<MediaEntity[]>;
    close(token: string, userId: string): Promise<{
        message: string;
    }>;
    cleanupExpiredSessions(): Promise<void>;
}
