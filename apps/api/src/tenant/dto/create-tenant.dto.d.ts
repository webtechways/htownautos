export declare class CreateTenantDto {
    name: string;
    slug: string;
    subdomain: string;
    ownerUsername: string;
    businessName?: string;
    taxId?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    settings?: Record<string, any>;
    twilioMessagingServiceSid?: string;
    logo?: string;
    isActive?: boolean;
}
