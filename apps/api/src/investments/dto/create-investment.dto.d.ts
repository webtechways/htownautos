export declare const INVESTMENT_SOURCES: readonly ["CREDIT_CARD", "CREDIT_LINE", "CAPITAL_FRIEND", "LOAN", "INVESTOR_GUEST"];
export declare const PAYBACK_INTERVALS: readonly ["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "ANNUAL", "ONE_TIME"];
export declare class CreateInvestmentDto {
    amount: number;
    source: string;
    sourceAccount?: string;
    payBackAmount?: number;
    payBackInterval?: string;
    settleDeadline?: string;
    notes?: string;
}
