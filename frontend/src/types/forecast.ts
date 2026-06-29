export interface ForecastResult {
  id: string;
  stationId: string;
  forecastAQI: number;
  confidence: number;
  category: string;
  riskLevel: string;
  forecastType: string;
  modelVersion: string;
  forecastDate: string;
  createdAt: string;
  currentAQI?: number;
}
