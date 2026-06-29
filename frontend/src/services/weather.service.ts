import { api } from '@/lib/api/api';
import { WeatherData, LatestWeatherItem, WeatherStatistics } from '@/types/weather';

export interface QueryWeatherParams {
  stationId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  city?: string;
}

export interface WeatherHistoryResponse {
  data: WeatherData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const weatherService = {
  async getHistory(params?: QueryWeatherParams): Promise<WeatherHistoryResponse> {
    return api.get<WeatherHistoryResponse>('/weather', { params });
  },

  async getLatest(city?: string): Promise<LatestWeatherItem[]> {
    const params = city ? { city } : undefined;
    return api.get<LatestWeatherItem[]>('/weather/live', { params });
  },

  async getStatistics(city?: string): Promise<WeatherStatistics> {
    const params = city ? { city } : undefined;
    return api.get<WeatherStatistics>('/weather/statistics', { params });
  },

  async getStationHistory(stationId: string): Promise<WeatherData[]> {
    return api.get<WeatherData[]>(`/weather/${stationId}`);
  },
};
