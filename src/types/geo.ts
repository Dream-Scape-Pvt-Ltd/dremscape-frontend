export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  name?: string;
}

export interface PostGISLineString {
  type: "LineString";
  coordinates: [number, number, number?][]; // [longitude, latitude, elevation?]
}

export interface PostGISFeature<G = PostGISLineString, P = Record<string, unknown>> {
  type: "Feature";
  geometry: G;
  properties: P;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  waypointName?: string;
  isPass?: boolean;
  isCamp?: boolean;
}
