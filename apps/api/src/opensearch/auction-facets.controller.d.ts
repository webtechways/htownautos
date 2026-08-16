import { AuctionFacetsService } from './auction-facets.service';
export declare class AuctionFacetsController {
    private readonly service;
    constructor(service: AuctionFacetsService);
    makes(yearFrom: number, yearTo: number): Promise<string[]>;
    models(make: string, yearFrom: number, yearTo: number): Promise<string[]>;
    trims(make: string, models: string, yearFrom: number, yearTo: number): Promise<string[]>;
    colors(): Promise<string[]>;
    titleTypes(): Promise<string[]>;
    yearBounds(): Promise<{
        min: number | null;
        max: number | null;
    }>;
}
