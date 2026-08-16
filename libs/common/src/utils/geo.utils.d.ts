export interface LatLng {
    lat: number;
    lon: number;
}
export declare function geocodeZip(zip?: string | null): LatLng | null;
export declare function haversineMiles(a: LatLng, b: LatLng): number;
export declare function boundingBox(center: LatLng, radiusMiles: number): {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
};
