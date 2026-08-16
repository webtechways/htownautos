import { Prisma } from '@prisma/client';
export interface WantedPreferenceCriteria {
    yearFrom: number | null;
    yearTo: number | null;
    make: string;
    models: string[];
    trims: string[];
    maxMileage: number | null;
    titleTypes: string[];
    colors: string[];
    maxCost: Prisma.Decimal | null;
}
export declare function preferenceToWhere(pref: WantedPreferenceCriteria): Prisma.AuctionListingWhereInput;
export declare function todayAsDateInt(now?: Date): number;
export declare function futureSaleWhere(todayInt?: number): Prisma.AuctionListingWhereInput;
