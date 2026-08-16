export interface VinDecodeResult {
    vin: string;
    year: number | null;
    make: string | null;
    model: string | null;
    trim: string | null;
    bodyType: string | null;
    transmission: string | null;
    drivetrain: string | null;
    fuelType: string | null;
    engine: string | null;
    cylinders: number | null;
    doors: number | null;
    exteriorColor: string | null;
    interiorColor: string | null;
    vehicleType: string | null;
}
export interface MarketCheckPriceResult {
    marketcheckPrice: number | null;
    msrp: number | null;
    cached: boolean;
    zip: string;
}
export interface MarketCheckCompsResult {
    listings: any[];
    numFound: number;
    cached: boolean;
}
export declare class MarketCheckService {
    private readonly logger;
    private readonly baseUrl;
    private readonly decodeUrl;
    private readonly priceUrl;
    private readonly searchUrl;
    private readonly apiKey;
    constructor();
    private readonly pageSize;
    private fetchTermsPage;
    private fetchTerms;
    getMakes(year: string): Promise<string[]>;
    getModels(year: string, make: string): Promise<string[]>;
    getTrims(year: string, make: string, model: string): Promise<string[]>;
    decodeVin(vin: string): Promise<VinDecodeResult>;
    getPrice(vin: string, miles: number, zip: string, dealerType?: string): Promise<MarketCheckPriceResult>;
    getComparables(make: string, model: string, year: string, zip: string): Promise<MarketCheckCompsResult>;
    getComparablesByVin(vin: string, zip: string): Promise<MarketCheckCompsResult>;
}
