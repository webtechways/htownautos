export declare class CreatePartConditionDto {
    slug: string;
    title: string;
    isActive?: boolean;
}
declare const UpdatePartConditionDto_base: import("@nestjs/common").Type<Partial<CreatePartConditionDto>>;
export declare class UpdatePartConditionDto extends UpdatePartConditionDto_base {
}
export declare class CreatePartStatusDto {
    slug: string;
    title: string;
    isActive?: boolean;
}
declare const UpdatePartStatusDto_base: import("@nestjs/common").Type<Partial<CreatePartStatusDto>>;
export declare class UpdatePartStatusDto extends UpdatePartStatusDto_base {
}
export declare class CreatePartCategoryDto {
    slug: string;
    title: string;
    description?: string;
    parentId?: string;
    isActive?: boolean;
}
declare const UpdatePartCategoryDto_base: import("@nestjs/common").Type<Partial<CreatePartCategoryDto>>;
export declare class UpdatePartCategoryDto extends UpdatePartCategoryDto_base {
}
export {};
