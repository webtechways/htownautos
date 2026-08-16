"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeZip = geocodeZip;
exports.haversineMiles = haversineMiles;
exports.boundingBox = boundingBox;
let lib;
function getLib() {
    if (lib === undefined) {
        try {
            lib = require('zipcodes');
        }
        catch {
            lib = null;
        }
    }
    return lib;
}
function geocodeZip(zip) {
    if (!zip)
        return null;
    const clean = zip.trim().slice(0, 5);
    if (!/^\d{5}$/.test(clean))
        return null;
    const rec = getLib()?.lookup(clean);
    if (!rec || typeof rec.latitude !== 'number' || typeof rec.longitude !== 'number') {
        return null;
    }
    return { lat: rec.latitude, lon: rec.longitude };
}
const EARTH_RADIUS_MILES = 3958.8;
function haversineMiles(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}
function boundingBox(center, radiusMiles) {
    const latDelta = radiusMiles / 69;
    const lonDelta = radiusMiles / (69 * Math.max(Math.cos((center.lat * Math.PI) / 180), 0.01));
    return {
        minLat: center.lat - latDelta,
        maxLat: center.lat + latDelta,
        minLon: center.lon - lonDelta,
        maxLon: center.lon + lonDelta,
    };
}
//# sourceMappingURL=geo.utils.js.map