import { InitMultipartDto } from './init-multipart.dto';
export declare class MultipartPartDto {
    partNumber: number;
    etag: string;
}
export declare class CompleteMultipartDto extends InitMultipartDto {
    uploadId: string;
    key: string;
    parts: MultipartPartDto[];
}
