export interface Hotspot {
  id: string;
  zoneId?: string | null;
  clusterId?: string | null;
  latitude: number;
  longitude: number;
  aqi: number;
  pm25?: number | null;
  pm10?: number | null;
  stationCount: number;
  radius: number;
  severity: string;
  detectedAt?: string;
}
