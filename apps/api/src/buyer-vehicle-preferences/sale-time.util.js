"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleMomentUtc = saleMomentUtc;
exports.isFutureSale = isFutureSale;
const TZ_ABBREV_TO_IANA = {
    CT: 'America/Chicago',
    CST: 'America/Chicago',
    CDT: 'America/Chicago',
    ET: 'America/New_York',
    EST: 'America/New_York',
    EDT: 'America/New_York',
    PT: 'America/Los_Angeles',
    PST: 'America/Los_Angeles',
    PDT: 'America/Los_Angeles',
    MT: 'America/Denver',
    MST: 'America/Denver',
    MDT: 'America/Denver',
    AT: 'America/Halifax',
    AST: 'America/Halifax',
    ADT: 'America/Halifax',
    HT: 'Pacific/Honolulu',
    HST: 'Pacific/Honolulu',
};
const DEFAULT_IANA = 'America/Chicago';
function tzOffsetMinutes(tz, at) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(at);
    const map = {};
    for (const p of parts)
        if (p.type !== 'literal')
            map[p.type] = p.value;
    const asIfUtc = Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day), Number(map.hour === '24' ? '00' : map.hour), Number(map.minute), Number(map.second));
    return (asIfUtc - at.getTime()) / 60000;
}
function saleMomentUtc(saleDate, saleTime, timeZone) {
    if (saleDate == null)
        return null;
    const raw = String(saleDate).padStart(8, '0');
    if (raw.length !== 8)
        return null;
    const year = Number(raw.slice(0, 4));
    const month = Number(raw.slice(4, 6));
    const day = Number(raw.slice(6, 8));
    if (!year || !month || !day)
        return null;
    const tRaw = (saleTime ?? '0000').replace(/[^\d]/g, '').padStart(4, '0').slice(0, 4);
    const hour = Number(tRaw.slice(0, 2));
    const minute = Number(tRaw.slice(2, 4));
    const iana = TZ_ABBREV_TO_IANA[(timeZone ?? '').trim().toUpperCase()] ?? DEFAULT_IANA;
    const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
    const offset1 = tzOffsetMinutes(iana, new Date(naiveUtc));
    let correctedUtc = naiveUtc - offset1 * 60000;
    const offset2 = tzOffsetMinutes(iana, new Date(correctedUtc));
    if (offset2 !== offset1) {
        correctedUtc = naiveUtc - offset2 * 60000;
    }
    return new Date(correctedUtc);
}
function isFutureSale(saleDate, saleTime, timeZone, now = new Date()) {
    if (saleDate == null)
        return true;
    const moment = saleMomentUtc(saleDate, saleTime, timeZone);
    if (!moment)
        return true;
    return moment.getTime() > now.getTime();
}
//# sourceMappingURL=sale-time.util.js.map