export type TitleCategory = 'clean' | 'nonrepairable' | 'salvage' | 'unknown';
export declare const ASSIGNABLE_TITLE_CATEGORIES: Exclude<TitleCategory, 'unknown'>[];
export declare const TITLE_CATEGORIES: TitleCategory[];
export declare const TITLE_CATEGORY_LABELS: Record<TitleCategory, string>;
export declare const TITLE_CATEGORY_CODES: Record<Exclude<TitleCategory, 'unknown'>, string[]>;
export type TitleOverrides = Record<string, Exclude<TitleCategory, 'unknown'>>;
export declare function deriveTitleCategory(raw?: string | null, overrides?: TitleOverrides): TitleCategory;
export declare function codesForTitleCategories(categories: string[], overrides?: TitleOverrides): string[];
export declare function allKnownCodes(overrides?: TitleOverrides): string[];
