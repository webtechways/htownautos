export declare enum MediaType {
    IMAGE = "image",
    VIDEO = "video",
    DOCUMENT = "document",
    AUDIO = "audio"
}
export declare enum MediaCategory {
    EXTERIOR = "exterior",
    INTERIOR = "interior",
    ENGINE = "engine",
    DOCUMENT = "document",
    RECEIPT = "receipt",
    TITLE = "title",
    OTHER = "other",
    INSPECTION_REQUEST = "inspection_request",
    INSPECTION_ITEM = "inspection_item",
    INSPECTION_ERROR_CODE = "inspection_error_code",
    INSPECTION_VOICE = "inspection_voice",
    INSPECTION_FULL_EXTERIOR_VIDEO = "inspection_full_exterior_video",
    INSPECTION_FULL_INTERIOR_VIDEO = "inspection_full_interior_video",
    INSPECTION_FULL_ENGINE_VIDEO = "inspection_full_engine_video"
}
export declare class CreateMediaDto {
    title?: string;
    description?: string;
    alt?: string;
    mediaType: MediaType;
    category?: MediaCategory;
    vehicleId?: string;
    buyerId?: string;
    partId?: string;
    inspectionId?: string;
    inspectionChecklistItemId?: string;
    inspectionRequestItemId?: string;
    inspectionErrorCodeId?: string;
    carfaxReportId?: string;
    isPublic?: boolean;
}
