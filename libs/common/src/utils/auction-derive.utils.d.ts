export type SellerCategory = 'Insurance' | 'Rental' | 'Repo' | 'Other';
export declare const SELLER_CATEGORIES: SellerCategory[];
export declare function deriveSellerCategory(rentals?: string | null, sellerName?: string | null): SellerCategory;
export declare function parseEngineSizeL(engine?: string | null): number | null;
