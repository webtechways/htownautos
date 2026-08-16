"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferenceToWhere = preferenceToWhere;
exports.todayAsDateInt = todayAsDateInt;
exports.futureSaleWhere = futureSaleWhere;
function preferenceToWhere(pref) {
    const where = {
        isStale: false,
        make: { equals: pref.make, mode: 'insensitive' },
    };
    if (pref.yearFrom || pref.yearTo) {
        const year = {};
        if (pref.yearFrom)
            year.gte = pref.yearFrom;
        if (pref.yearTo)
            year.lte = pref.yearTo;
        where.year = year;
    }
    if (pref.models.length > 0) {
        where.modelGroup = { in: pref.models, mode: 'insensitive' };
    }
    if (pref.trims.length > 0) {
        where.trim = { in: pref.trims, mode: 'insensitive' };
    }
    if (pref.titleTypes.length > 0) {
        where.saleTitleType = { in: pref.titleTypes, mode: 'insensitive' };
    }
    if (pref.colors.length > 0) {
        where.color = { in: pref.colors, mode: 'insensitive' };
    }
    const andClauses = [];
    if (pref.maxMileage != null) {
        andClauses.push({
            OR: [{ odometer: { lte: pref.maxMileage } }, { odometer: null }],
        });
    }
    if (pref.maxCost != null) {
        andClauses.push({
            OR: [{ highBid: { lte: pref.maxCost } }, { highBid: null }],
        });
    }
    if (andClauses.length > 0) {
        where.AND = andClauses;
    }
    return where;
}
function todayAsDateInt(now = new Date()) {
    return (now.getUTCFullYear() * 10000 +
        (now.getUTCMonth() + 1) * 100 +
        now.getUTCDate());
}
function futureSaleWhere(todayInt = todayAsDateInt()) {
    return {
        OR: [{ saleDate: null }, { saleDate: { gte: todayInt - 1 } }],
    };
}
//# sourceMappingURL=preference-to-where.js.map