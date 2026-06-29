import { api } from '@/lib/api/api';
import { LiveAqiItem, AqiReading, AqiStatistics } from '@/types/aqi';

export interface QueryHistoryParams {
  stationId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  city?: string;
}

export interface HistoryResponse {
  data: AqiReading[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const aqiService = {
  async getLive(city?: string): Promise<LiveAqiItem[]> {
    const params = city ? { city } : undefined;
    return api.get<LiveAqiItem[]>('/aqi/live', { params });
  },

  async getHistory(params?: QueryHistoryParams): Promise<HistoryResponse> {
    return api.get<HistoryResponse>('/aqi/history', { params });
  },

  async getStatistics(city?: string): Promise<AqiStatistics> {
    const params = city ? { city } : undefined;
    return api.get<AqiStatistics>('/aqi/statistics', { params });
  },
};
