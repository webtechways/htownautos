export declare class CreateNotificationDto {
    title: string;
    message: string;
    type: string;
    entityType?: string;
    entityId?: string;
    actionUrl?: string;
    priority?: string;
    metaValue?: Record<string, unknown>;
}
