"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TITLE_CATEGORY_CODES = exports.TITLE_CATEGORY_LABELS = exports.TITLE_CATEGORIES = exports.ASSIGNABLE_TITLE_CATEGORIES = void 0;
exports.deriveTitleCategory = deriveTitleCategory;
exports.codesForTitleCategories = codesForTitleCategories;
exports.allKnownCodes = allKnownCodes;
exports.ASSIGNABLE_TITLE_CATEGORIES = [
    'clean',
    'nonrepairable',
    'salvage',
];
exports.TITLE_CATEGORIES = [
    'clean',
    'nonrepairable',
    'salvage',
    'unknown',
];
exports.TITLE_CATEGORY_LABELS = {
    clean: 'Clean Title',
    nonrepairable: 'Non-repairable',
    salvage: 'Salvage Title',
    unknown: 'Unknown',
};
exports.TITLE_CATEGORY_CODES = {
    clean: ['ct', 'cz', 'fs'],
    nonrepairable: ['nr', 'cd', 'po', 'nu', 'sr', 'bp'],
    salvage: [
        'st',
        'sc',
        'sv',
        's1',
        'sd',
        'rb',
        'ps',
        'dv',
        'rs',
        'sm',
        'ls',
        'bs',
    ],
};
const BASE_CODE_TO_CATEGORY = (() => {
    const map = {};
    for (const cat of exports.ASSIGNABLE_TITLE_CATEGORIES) {
        for (const code of exports.TITLE_CATEGORY_CODES[cat])
            map[code] = cat;
    }
    return map;
})();
function deriveTitleCategory(raw, overrides) {
    if (!raw)
        return 'unknown';
    const v = raw.toLowerCase().trim();
    if (overrides && overrides[v])
        return overrides[v];
    const byCode = BASE_CODE_TO_CATEGORY[v];
    if (byCode)
        return byCode;
    if (v.includes('clean') || v.includes('clear'))
        return 'clean';
    if (v.includes('non-repair') ||
        v.includes('nonrepair') ||
        v.includes('non repair') ||
        v.includes('parts only') ||
        v.includes('part only') ||
        v.includes('destruction') ||
        v.includes('junk')) {
        return 'nonrepairable';
    }
    return 'unknown';
}
function codesForTitleCategories(categories, overrides) {
    const wanted = new Set(categories);
    const out = new Set();
    for (const cat of exports.ASSIGNABLE_TITLE_CATEGORIES) {
        if (wanted.has(cat))
            for (const c of exports.TITLE_CATEGORY_CODES[cat])
                out.add(c);
    }
    if (overrides) {
        for (const [code, cat] of Object.entries(overrides)) {
            if (wanted.has(cat))
                out.add(code);
        }
    }
    return [...out];
}
function allKnownCodes(overrides) {
    const out = new Set(Object.keys(BASE_CODE_TO_CATEGORY));
    if (overrides)
        for (const code of Object.keys(overrides))
            out.add(code);
    return [...out];
}
//# sourceMappingURL=title-category.utils.js.map