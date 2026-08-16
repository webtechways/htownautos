import { EmailDirection, EmailStatus, EmailPriority } from './create-email-message.dto';
export declare class QueryEmailMessageDto {
    buyerId?: string;
    senderId?: string;
    direction?: EmailDirection;
    status?: EmailStatus;
    priority?: EmailPriority;
    isRead?: boolean;
    threadId?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
