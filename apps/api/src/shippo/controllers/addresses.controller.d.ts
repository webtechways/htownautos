import { ShippoService } from '../shippo.service';
declare class CreateShippoAddressDto {
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
    isResidential?: boolean;
    validate?: boolean;
    metadata?: string;
}
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
export declare class ShippoAddressesController {
    private readonly shippo;
    constructor(shippo: ShippoService);
    list(page?: string, results?: string): Promise<unknown>;
    create(dto: CreateShippoAddressDto): Promise<unknown>;
    validate(dto: ValidateAddressDto): Promise<{
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
    get(id: string): Promise<import("shippo").Address>;
    validateById(id: string): Promise<unknown>;
}
export {};
