export declare class CreatePaymentLinkDto {
    amount: number;
    description: string;
    note?: string;
    deliveryMethod: 'sms' | 'email' | 'link';
}
