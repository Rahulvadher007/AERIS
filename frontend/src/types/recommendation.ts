export interface Recommendation {
  zone: string;
  city: string;
  priority: string;
  reason: string;
  forecastAQI: number;
  actions: string[];
  expectedReduction: string;
  confidence: number;
}
