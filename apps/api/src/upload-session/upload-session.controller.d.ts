import { UploadSessionService } from './upload-session.service';
import { CreateUploadSessionDto } from './dto/create-upload-session.dto';
export declare class UploadSessionController {
    private readonly uploadSessionService;
    constructor(uploadSessionService: UploadSessionService);
    create(dto: CreateUploadSessionDto, req: any): Promise<{
        token: string;
        expiresAt: Date;
    }>;
    getSessionMedia(token: string): Promise<import("../../../image-service/src/media").MediaEntity[]>;
    close(token: string, req: any): Promise<{
        message: string;
    }>;
}
