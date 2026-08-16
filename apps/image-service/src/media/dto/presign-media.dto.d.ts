import { CreateMediaDto } from './create-media.dto';
export declare class PresignMediaDto extends CreateMediaDto {
    filename: string;
    contentType: string;
    fileSize: number;
}
