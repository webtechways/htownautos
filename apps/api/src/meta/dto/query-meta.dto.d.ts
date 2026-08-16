import { MetaEntityType, MetaValueType } from './create-meta.dto';
export declare class QueryMetaDto {
    entityType?: MetaEntityType;
    entityId?: string;
    userId?: string;
    key?: string;
    valueType?: MetaValueType;
    isPublic?: boolean;
    isSystem?: boolean;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
