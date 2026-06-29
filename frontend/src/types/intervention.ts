import { Hotspot } from './hotspot';
import { TrafficData } from './traffic';

export interface Zone {
  id: string;
  zoneCode: string;
  zoneName: string;
  city: string;
  geometry?: any;
  createdAt: string;
  updatedAt: string;
  hotspots?: Hotspot[];
  roads?: {
    id: string;
    roadCode: string;
    roadName: string;
    traffic?: TrafficData[];
  }[];
}

export interface Intervention {
  id: string;
  zoneId: string;
  forecastId?: string | null;
  priority: string;
  riskLevel: string;
  title: string;
  description: string;
  recommendedActions: string[];
  expectedImpact: string;
  estimatedAQIReduction: string;
  postInterventionAQI: number;
  confidenceScore: number;
  createdAt: string;
  zone?: Zone;
  currentAQI?: number;
  forecastAQI?: number;
  contributingFactors?: string[];
}

export interface InterventionDashboardMetrics {
  total: number;
  critical: number;
  high: number;
  criticalZones: Intervention[];
}
