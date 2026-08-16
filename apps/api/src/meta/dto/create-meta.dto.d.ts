export declare enum MetaEntityType {
    USER = "user",
    VEHICLE = "vehicle",
    BUYER = "buyer",
    DEAL = "deal",
    TITLE = "title",
    MEDIA = "media",
    VEHICLE_YEAR = "vehicleYear",
    VEHICLE_MAKE = "vehicleMake",
    VEHICLE_MODEL = "vehicleModel",
    VEHICLE_TRIM = "vehicleTrim",
    EXTRA_EXPENSE = "extraExpense"
}
export declare enum MetaValueType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    JSON = "json",
    DATE = "date"
}
export declare class CreateMetaDto {
    entityType: MetaEntityType;
    entityId: string;
    userId?: string;
    key: string;
    value: string;
    valueType?: MetaValueType;
    description?: string;
    isPublic?: boolean;
    isSystem?: boolean;
    isActive?: boolean;
}
