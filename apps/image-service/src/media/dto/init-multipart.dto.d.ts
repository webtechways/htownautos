import { CreateMediaDto } from './create-media.dto';
export declare class InitMultipartDto extends CreateMediaDto {
    filename: string;
    contentType: string;
    fileSize: number;
}
