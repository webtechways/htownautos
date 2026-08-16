import { MetaEntityType, MetaValueType } from '../dto/create-meta.dto';
export declare class Meta {
    id: string;
    entityType: MetaEntityType;
    entityId: string;
    userId: string | null;
    key: string;
    value: string;
    valueType: MetaValueType;
    description: string | null;
    isPublic: boolean;
    isSystem: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
