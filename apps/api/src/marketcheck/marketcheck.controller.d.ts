import { MarketCheckService } from './marketcheck.service';
export declare class MarketCheckController {
    private readonly marketCheckService;
    constructor(marketCheckService: MarketCheckService);
    getMakes(year: string): Promise<{
        data: string[];
    }>;
    getModels(year: string, make: string): Promise<{
        data: string[];
    }>;
    getTrims(year: string, make: string, model: string): Promise<{
        data: string[];
    }>;
    decodeVin(vin: string): Promise<{
        data: import("./marketcheck.service").VinDecodeResult;
    }>;
    getPrice(vin: string, miles: string, zip: string, dealerType?: string): Promise<{
        data: import("./marketcheck.service").MarketCheckPriceResult;
    }>;
    getComparables(make: string, model: string, year: string, zip: string): Promise<{
        data: import("./marketcheck.service").MarketCheckCompsResult;
    }>;
    getComparablesByVin(vin: string, zip: string): Promise<{
        data: import("./marketcheck.service").MarketCheckCompsResult;
    }>;
}
