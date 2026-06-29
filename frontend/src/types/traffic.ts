export interface TrafficData {
  id: string;
  roadId: string;
  latitude: number;
  longitude: number;
  congestionScore: number;
  averageSpeed: number;
  vehicleCount: number;
  timestamp: string;
  createdAt: string;
  road?: {
    id: string;
    roadCode: string;
    roadName: string;
    zoneId?: string | null;
  };
}

export interface TrafficStatistics {
  averageCongestion?: number;
  peakCongestion?: number;
  totalVehicles?: number;
  averageSpeed?: number;
}
