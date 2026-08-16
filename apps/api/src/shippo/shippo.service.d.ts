import { Shippo } from 'shippo';
export interface ShippoAddressDto {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
    company?: string;
}
export interface ShippoParcelDto {
    length: number;
    width: number;
    height: number;
    distance_unit: 'in' | 'cm';
    weight: number;
    mass_unit: 'lb' | 'kg' | 'oz' | 'g';
}
export declare class ShippoService {
    private readonly logger;
    private client;
    constructor();
    get sdk(): Shippo;
    private safeCall;
    listAddresses(page?: number, results?: number): Promise<unknown>;
    getAddress(addressId: string): Promise<import("shippo").Address>;
    createAddress(payload: Record<string, unknown>): Promise<unknown>;
    validateAddressById(addressId: string): Promise<unknown>;
    validateAddress(input: {
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
    }): Promise<{
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
    private formatValidation;
    listParcels(page?: number, results?: number): Promise<unknown>;
    getParcel(parcelId: string): Promise<import("shippo").Parcel>;
    createParcel(payload: Record<string, unknown>): Promise<unknown>;
    listShipments(query?: {
        page?: number;
        results?: number;
        objectCreatedGte?: string;
        objectCreatedLte?: string;
    }): Promise<unknown>;
    getShipment(shipmentId: string): Promise<import("shippo").Shipment>;
    createShipment(params: {
        addressFrom: ShippoAddressDto;
        addressTo: ShippoAddressDto;
        parcel: ShippoParcelDto;
        carrierAccounts?: string[];
        metadata?: string;
        shipmentDate?: string;
        customsDeclaration?: string | Record<string, unknown>;
        extra?: Record<string, unknown>;
    }): Promise<import("shippo").Shipment>;
    createShipmentRaw(request: Record<string, unknown>): Promise<unknown>;
    getUpsRates(shipmentId: string): Promise<import("shippo").Rate[]>;
    getRate(rateId: string): Promise<import("shippo").Rate>;
    listShipmentRates(shipmentId: string, page?: number, results?: number): Promise<import("shippo").RatePaginatedList>;
    listShipmentRatesByCurrencyCode(shipmentId: string, currencyCode: string, page?: number, results?: number): Promise<unknown>;
    listTransactions(query?: {
        page?: number;
        results?: number;
        rate?: string;
        trackingNumber?: string;
        objectStatus?: string;
    }): Promise<unknown>;
    getTransaction(transactionId: string): Promise<import("shippo").Transaction>;
    buyLabel(rateId: string, labelFileType?: 'PDF' | 'PDF_4x6' | 'PNG' | 'ZPLII'): Promise<import("shippo").Transaction>;
    createTransaction(request: Record<string, unknown>): Promise<unknown>;
    registerTracking(carrier: string, trackingNumber: string, metadata?: string): Promise<unknown>;
    getTracking(carrier: string, trackingNumber: string): Promise<import("shippo").Track | null>;
    listRefunds(query?: {
        page?: number;
        results?: number;
    }): Promise<unknown>;
    getRefund(refundId: string): Promise<import("shippo").Refund>;
    refundLabel(transactionId: string): Promise<import("shippo").Refund>;
    listCarrierAccounts(query?: {
        carrier?: string;
        serviceLevels?: string[];
        page?: number;
        results?: number;
    }): Promise<unknown>;
    getCarrierAccount(id: string): Promise<import("shippo").CarrierAccount>;
    createCarrierAccount(payload: Record<string, unknown>): Promise<unknown>;
    updateCarrierAccount(id: string, payload: Record<string, unknown>): Promise<unknown>;
    initiateOauth2Signin(carrierAccountId: string, redirectUri: string, state?: string): Promise<unknown>;
    registerCarrierAccount(payload: Record<string, unknown>): Promise<unknown>;
    getRegistrationStatus(carrier: string): Promise<unknown>;
    listCarrierParcelTemplates(carrier?: string, include?: 'all' | 'user' | 'enabled'): Promise<unknown>;
    getCarrierParcelTemplate(token: string): Promise<unknown>;
    listUpsCarrierParcelTemplates(): Promise<{
        carrier: string;
        token: string;
        name: string;
        length: number;
        width: number;
        height: number;
        distance_unit: string;
    }[]>;
    listSupportedCarrierParcelTemplates(): Promise<{
        carrier: string;
        token: string;
        name: string;
        length: number;
        width: number;
        height: number;
        distance_unit: string;
    }[]>;
    listUserParcelTemplates(): Promise<unknown>;
    getUserParcelTemplate(id: string): Promise<unknown>;
    createUserParcelTemplate(params: {
        name: string;
        length: number | string;
        width: number | string;
        height: number | string;
        distanceUnit: 'in' | 'cm';
        weight?: number | string;
        weightUnit?: 'lb' | 'kg' | 'oz' | 'g';
    }): Promise<any>;
    updateUserParcelTemplate(objectId: string, params: {
        name: string;
        length: number | string;
        width: number | string;
        height: number | string;
        distanceUnit: 'in' | 'cm';
        weight?: number | string;
        weightUnit?: 'lb' | 'kg' | 'oz' | 'g';
    }): Promise<any>;
    deleteUserParcelTemplate(objectId: string): Promise<any>;
    listCustomsItems(page?: number, results?: number): Promise<unknown>;
    getCustomsItem(id: string): Promise<import("shippo").CustomsItem>;
    createCustomsItem(payload: Record<string, unknown>): Promise<unknown>;
    listCustomsDeclarations(page?: number, results?: number): Promise<unknown>;
    getCustomsDeclaration(id: string): Promise<import("shippo").CustomsDeclaration>;
    createCustomsDeclaration(payload: Record<string, unknown>): Promise<unknown>;
    listManifests(page?: number, results?: number): Promise<unknown>;
    getManifest(id: string): Promise<import("shippo").Manifest>;
    createManifest(payload: {
        carrierAccount: string;
        shipmentDate: string;
        transactions: string[];
        addressFrom: Record<string, unknown> | string;
        metadata?: string;
    }): Promise<unknown>;
    listOrders(query?: {
        page?: number;
        results?: number;
        orderStatus?: string[];
        shopApp?: string;
    }): Promise<unknown>;
    getOrder(id: string): Promise<import("shippo").Order>;
    createOrder(payload: Record<string, unknown>): Promise<unknown>;
    createPickup(payload: {
        carrierAccount: string;
        location: Record<string, unknown>;
        transactions: string[];
        requestedStartTime: string;
        requestedEndTime: string;
        isTest?: boolean;
        metadata?: string;
    }): Promise<unknown>;
    listServiceGroups(query?: Record<string, unknown>): Promise<unknown>;
    createServiceGroup(payload: Record<string, unknown>): Promise<unknown>;
    updateServiceGroup(payload: Record<string, unknown>): Promise<unknown>;
    deleteServiceGroup(id: string): Promise<unknown>;
    createBatch(payload: Record<string, unknown>): Promise<unknown>;
    getBatch(id: string, page?: number, results?: number): Promise<unknown>;
    addShipmentsToBatch(batchId: string, shipments: Array<Record<string, unknown>>): Promise<unknown>;
    removeShipmentsFromBatch(batchId: string, shipmentIds: string[]): Promise<unknown>;
    purchaseBatch(batchId: string): Promise<unknown>;
    createLiveRates(payload: Record<string, unknown>): Promise<unknown>;
    getDefaultParcelTemplate(): Promise<unknown>;
    updateDefaultParcelTemplate(payload: Record<string, unknown>): Promise<unknown>;
    deleteDefaultParcelTemplate(): Promise<unknown>;
    listWebhooks(): Promise<unknown>;
    getWebhook(id: string): Promise<unknown>;
    createWebhook(payload: {
        url: string;
        event?: string;
        eventType?: string;
        active?: boolean;
        isActive?: boolean;
        isTest?: boolean;
    }): Promise<unknown>;
    updateWebhook(id: string, payload: Record<string, unknown>): Promise<unknown>;
    deleteWebhook(id: string): Promise<unknown>;
    verifyWebhookSignature(rawBody: Buffer | string, signatureHeader: string | undefined): boolean;
}
export declare const UPS_STATIC_TEMPLATES: {
    token: string;
    name: string;
    length: number;
    width: number;
    height: number;
    distance_unit: string;
}[];
