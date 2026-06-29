import { api } from '@/lib/api/api';
import { TrafficData, TrafficStatistics } from '@/types/traffic';

export interface QueryTrafficParams {
  roadSegment?: string;
  zoneId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  city?: string;
}

export interface TrafficHistoryResponse {
  data: TrafficData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const trafficService = {
  async getHistory(params?: QueryTrafficParams): Promise<TrafficHistoryResponse> {
    return api.get<TrafficHistoryResponse>('/traffic', { params });
  },

  async getLatest(city?: string): Promise<TrafficData[]> {
    const params = city ? { city } : undefined;
    return api.get<TrafficData[]>('/traffic/latest', { params });
  },

  async getStatistics(city?: string): Promise<TrafficStatistics> {
    const params = city ? { city } : undefined;
    return api.get<TrafficStatistics>('/traffic/statistics', { params });
  },

  async getCongestionHotspots(city?: string): Promise<any> {
    const params = city ? { city } : undefined;
    return api.get<any>('/traffic/congestion-hotspots', { params });
  },

  async getZoneAnalytics(city?: string): Promise<any[]> {
    const params = city ? { city } : undefined;
    return api.get<any[]>('/traffic/zones', { params });
  },

  async correlate(roadId: string, timestamp?: string): Promise<any> {
    const url = `/traffic/correlate/${roadId}${timestamp ? `?timestamp=${timestamp}` : ''}`;
    return api.get<any>(url);
  },
};
