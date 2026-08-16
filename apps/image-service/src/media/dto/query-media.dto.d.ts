import { MediaType, MediaCategory } from './create-media.dto';
export declare class QueryMediaDto {
    page?: number;
    limit?: number;
    vehicleId?: string;
    buyerId?: string;
    partId?: string;
    mediaType?: MediaType;
    category?: MediaCategory;
    isActive?: boolean;
}
