declare class WebhookBuildInfo {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    body_type?: string;
    transmission?: string;
    drivetrain?: string;
    fuel_type?: string;
    engine?: string;
    cylinders?: number;
}
declare class WebhookLocation {
    city?: string;
    state?: string;
    zip?: string;
    street?: string;
    latitude?: string;
    longitude?: string;
}
declare class WebhookDealer {
    id?: number;
    name?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    website?: string;
}
declare class WebhookMedia {
    photo_links?: string[];
}
export declare class MarketCheckListingWebhookDto {
    id: string;
    vin: string;
    heading?: string;
    miles?: number;
    price?: number;
    exterior_color?: string;
    interior_color?: string;
    dom?: number;
    dom_active?: number;
    seller_type?: string;
    inventory_type?: string;
    carfax_1_owner?: boolean;
    carfax_clean_title?: boolean;
    first_seen_at_date?: string;
    last_seen_at_date?: string;
    vdp_url?: string;
    source?: string;
    data_source?: string;
    in_transit?: boolean;
    build?: WebhookBuildInfo;
    car_location?: WebhookLocation;
    dealer?: WebhookDealer;
    media?: WebhookMedia;
}
export declare class MarketCheckWebhookPayloadDto {
    event: string;
    timestamp?: string;
    listing?: MarketCheckListingWebhookDto;
    listings?: MarketCheckListingWebhookDto[];
}
export {};
