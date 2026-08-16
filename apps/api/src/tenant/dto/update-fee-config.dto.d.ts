export declare class BrokerFeeDto {
    fixed: number;
    pct: number;
}
export declare class BiddingFeeRowDto {
    min: number;
    max: number | null;
    cs: number | string;
    cu: number | string;
    ns: number | string;
    nu: number | string;
}
export declare class BiddingFeeTableDto {
    rows: BiddingFeeRowDto[];
}
export declare class UpdateFeeConfigDto {
    paymentMethod: 'secured' | 'unsecured';
    gateFee: number;
    environmentalFee: number;
    broker: BrokerFeeDto;
    biddingFee: BiddingFeeTableDto;
}
