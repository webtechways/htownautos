export declare class OrderItemDto {
    partId: string;
    quantity: number;
    unitPrice?: number;
}
export declare class ShipToAddressDto {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
}
export declare class CreateOrderDto {
    buyerId: string;
    items: OrderItemDto[];
    taxRate?: number;
    discount?: number;
    shippingMethod?: 'pickup' | 'ship';
    shipTo?: ShipToAddressDto;
    notes?: string;
}
export declare class UpdateOrderDto {
    items?: OrderItemDto[];
    taxRate?: number;
    discount?: number;
    shippingMethod?: string;
    shipTo?: ShipToAddressDto;
    notes?: string;
    status?: string;
}
export declare class CreateShipmentDto {
    parcelTemplateId?: string;
    length: number;
    width: number;
    height: number;
    distanceUnit?: string;
    weight: number;
    massUnit?: string;
}
export declare class BuyLabelDto {
    rateId: string;
}
export declare class EstimateShippingDto {
    shipTo: ShipToAddressDto;
    items: OrderItemDto[];
}
export declare class ChargeOrderDto {
    paymentMethodId?: string;
    mode?: 'charge' | 'send_link_sms' | 'send_link_email';
}
