import { SmsDirection, SmsStatus } from './create-sms.dto';
export declare class QuerySmsDto {
    buyerId?: string;
    senderId?: string;
    direction?: SmsDirection;
    status?: SmsStatus;
    isRead?: boolean;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
