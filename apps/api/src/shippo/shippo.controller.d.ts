import { ShippoService } from './shippo.service';
declare class ValidateAddressDto {
    name?: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    phone?: string;
    email?: string;
}
export declare class ShippoController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    validateAddress(dto: ValidateAddressDto): Promise<{
        isValid: boolean;
        hasSuggestion: boolean;
        messages: any;
        original: any;
        suggested: {
            name: any;
            company: any;
            street1: any;
            street2: any;
            city: any;
            state: any;
            zip: any;
            country: any;
            phone: any;
            email: any;
        };
    }>;
}
export {};
