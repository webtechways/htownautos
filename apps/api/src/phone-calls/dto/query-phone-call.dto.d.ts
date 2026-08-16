import { CallDirection, CallStatus, CallOutcome } from './create-phone-call.dto';
export declare class QueryPhoneCallDto {
    buyerId?: string;
    phones?: string;
    callerId?: string;
    direction?: CallDirection;
    status?: CallStatus;
    outcome?: CallOutcome;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
