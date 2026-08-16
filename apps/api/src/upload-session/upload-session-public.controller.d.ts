import { UploadSessionService } from './upload-session.service';
import { PresignMediaDto } from '@htownautos/media';
import { ConfirmMediaDto } from '@htownautos/media';
export declare class UploadSessionPublicController {
    private readonly uploadSessionService;
    constructor(uploadSessionService: UploadSessionService);
    getSessionInfo(token: string): Promise<{
        entityType: string;
        mediaType: string;
        category: string | null;
        isPublic: boolean;
        expiresAt: Date;
    }>;
    presign(token: string, dto: PresignMediaDto): Promise<any>;
    confirm(token: string, dto: ConfirmMediaDto): Promise<import("@htownautos/media").MediaEntity>;
}
