export interface AqiReading {
  id: string;
  stationId: string;
  timestamp: string;
  aqi: number;
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
  so2?: number | null;
  co?: number | null;
  o3?: number | null;
  nh3?: number | null;
  createdAt: string;
  category?: string;
  healthRisk?: string;
}

export interface LiveAqiItem {
  station: {
    id: string;
    code: string;
    name: string;
  };
  latestReading: AqiReading | null;
}

export interface AqiStatistics {
  averageAQI: number;
  minimumAQI: number;
  maximumAQI: number;
  totalReadings: number;
  totalStations: number;
}
