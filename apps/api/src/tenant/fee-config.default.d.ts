export type FeeValue = number | string;
export interface BiddingFeeRow {
    min: number;
    max: number | null;
    cs: FeeValue;
    cu: FeeValue;
    ns: FeeValue;
    nu: FeeValue;
}
export interface FeeConfig {
    paymentMethod: 'secured' | 'unsecured';
    gateFee: number;
    environmentalFee: number;
    broker: {
        fixed: number;
        pct: number;
    };
    biddingFee: {
        rows: BiddingFeeRow[];
    };
}
export declare const DEFAULT_FEE_CONFIG: FeeConfig;
export interface FinalPriceBreakdown {
    highBid: number;
    biddingFee: number;
    gateFee: number;
    environmentalFee: number;
    auctionFee: number;
    brokerFee: number;
    finalPrice: number;
}
export declare function computeFinalPrice(highBid: number, titleType: 'clean' | 'nonClean', config: FeeConfig, paymentMethod?: 'secured' | 'unsecured'): FinalPriceBreakdown;
