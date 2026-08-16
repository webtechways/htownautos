"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SELLER_CATEGORIES = void 0;
exports.deriveSellerCategory = deriveSellerCategory;
exports.parseEngineSizeL = parseEngineSizeL;
exports.SELLER_CATEGORIES = [
    'Insurance',
    'Rental',
    'Repo',
    'Other',
];
const REPO_PATTERNS = [
    'repo',
    'recovery',
    'credit union',
    'financial',
    'finance',
    'bank',
    'lending',
    'loan',
    'acceptance',
    'capital',
    'santander',
    'ally',
    'credit',
];
const RENTAL_PATTERNS = [
    'rental',
    'rent a car',
    'rent-a-car',
    'enterprise',
    'hertz',
    'avis',
    'budget',
    'sixt',
    'national car',
    'alamo',
    'fleet',
];
const INSURANCE_PATTERNS = [
    'insurance',
    'insur',
    'geico',
    'progressive',
    'allstate',
    'state farm',
    'usaa',
    'nationwide',
    'liberty mutual',
    'farmers',
    'esurance',
    'assurance',
    'casualty',
    'mutual',
];
function deriveSellerCategory(rentals, sellerName) {
    if (rentals && rentals.trim().toUpperCase().startsWith('Y'))
        return 'Rental';
    const name = (sellerName ?? '').toLowerCase();
    if (name) {
        if (RENTAL_PATTERNS.some((p) => name.includes(p)))
            return 'Rental';
        if (REPO_PATTERNS.some((p) => name.includes(p)))
            return 'Repo';
        if (INSURANCE_PATTERNS.some((p) => name.includes(p)))
            return 'Insurance';
    }
    return 'Other';
}
function parseEngineSizeL(engine) {
    if (!engine)
        return null;
    const s = engine.toLowerCase();
    const litreMatch = s.match(/(\d\.\d)\s*(?:l\b|liter|litre|l\s|$)/);
    if (litreMatch) {
        const n = parseFloat(litreMatch[1]);
        if (n > 0 && n < 12)
            return n;
    }
    const ccMatch = s.match(/(\d{3,4})\s*cc\b/);
    if (ccMatch) {
        const n = parseInt(ccMatch[1], 10) / 1000;
        if (n > 0 && n < 12)
            return Math.round(n * 10) / 10;
    }
    const loose = s.match(/\b(\d\.\d)\b/);
    if (loose) {
        const n = parseFloat(loose[1]);
        if (n > 0 && n < 12)
            return n;
    }
    return null;
}
//# sourceMappingURL=auction-derive.utils.js.map