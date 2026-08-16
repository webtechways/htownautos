export type AuctionSource = 'copart' | 'iaai';
export interface UnifiedAuction {
    id: string;
    source: AuctionSource;
    sourceId: string;
    vin: string | null;
    year: number | null;
    make: string | null;
    model: string | null;
    trim: string | null;
    bodyType: string | null;
    color: string | null;
    interiorColor: string | null;
    engine: string | null;
    transmission: string | null;
    fuelType: string | null;
    drivetrain: string | null;
    cylinders: string | null;
    odometer: number | null;
    odometerBrand: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationZip: string | null;
    locationCountry: string | null;
    images: string[];
    mainImage: string | null;
    createdAt: string;
    updatedAt: string | null;
    indexedAt: string;
    damageDescription: string | null;
    secondaryDamage: string | null;
    saleDate: number | null;
    saleDateFormatted: string | null;
    dayOfWeek: string | null;
    saleTime: string | null;
    saleStatus: string | null;
    saleTitleState: string | null;
    saleTitleType: string | null;
    hasKeys: string | null;
    runsDrives: string | null;
    lotCondCode: string | null;
    wholesale: string | null;
    saleLight: string | null;
    highBid: number | null;
    buyItNowPrice: number | null;
    estRetailValue: number | null;
    repairCost: number | null;
    yardName: string | null;
    yardNumber: number | null;
    itemNumber: number | null;
    sellerName: string | null;
    sellerCategory: string | null;
    engineSizeL: number | null;
    geoPoint: {
        lat: number;
        lon: number;
    } | null;
    discarded?: boolean;
    discardReason?: string | null;
    discardedAt?: string | null;
    carfax1Owner: boolean | null;
    carfaxCleanTitle: boolean | null;
    dom: number | null;
    domActive: number | null;
    dealerName: string | null;
    dealerCity: string | null;
    dealerState: string | null;
    dealerPhone: string | null;
    heading: string | null;
    vdpUrl: string | null;
    sellerType: string | null;
    inventoryType: string | null;
}
export interface UnifiedAuctionDocument extends Omit<UnifiedAuction, 'createdAt' | 'updatedAt' | 'indexedAt'> {
    createdAt: Date;
    updatedAt: Date | null;
    indexedAt: Date;
}
export interface AuctionAggregations {
    sources: Array<{
        key: string;
        count: number;
    }>;
    makes: Array<{
        key: string;
        count: number;
    }>;
    models: Array<{
        key: string;
        count: number;
    }>;
    trims: Array<{
        key: string;
        count: number;
    }>;
    years: Array<{
        key: number;
        count: number;
    }>;
    states: Array<{
        key: string;
        count: number;
    }>;
    bodyTypes: Array<{
        key: string;
        count: number;
    }>;
    transmissions: Array<{
        key: string;
        count: number;
    }>;
    fuelTypes: Array<{
        key: string;
        count: number;
    }>;
    damageTypes: Array<{
        key: string;
        count: number;
    }>;
    saleStatuses: Array<{
        key: string;
        count: number;
    }>;
    titleTypes: Array<{
        key: string;
        count: number;
    }>;
    titleCategories: Array<{
        key: string;
        count: number;
    }>;
    colors: Array<{
        key: string;
        count: number;
    }>;
    cylinders: Array<{
        key: string;
        count: number;
    }>;
    drivetrains: Array<{
        key: string;
        count: number;
    }>;
    sellerCategories: Array<{
        key: string;
        count: number;
    }>;
    yards: Array<{
        key: string;
        count: number;
    }>;
    sellers: Array<{
        key: string;
        count: number;
    }>;
    lotCondCodes: Array<{
        key: string;
        count: number;
    }>;
    runsDrivesOptions: Array<{
        key: string;
        count: number;
    }>;
    saleLights: Array<{
        key: string;
        count: number;
    }>;
}
export interface AuctionSearchResult {
    data: UnifiedAuction[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    aggregations?: AuctionAggregations;
}
