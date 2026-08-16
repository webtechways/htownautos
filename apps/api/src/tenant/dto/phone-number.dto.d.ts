export declare enum SearchType {
    STATE = "state",
    AREA_CODE = "areaCode",
    TOLL_FREE = "tollFree"
}
export declare enum NumberType {
    LOCAL = "local",
    TOLL_FREE = "tollFree"
}
export declare class SearchPhoneNumbersDto {
    type: SearchType;
    value?: string;
    numberType?: NumberType;
}
export declare class PurchasePhoneNumberDto {
    phoneNumber: string;
    friendlyName?: string;
    isPrimary?: boolean;
}
export declare class UpdatePhoneNumberDto {
    friendlyName?: string;
    isPrimary?: boolean;
    isActive?: boolean;
}
