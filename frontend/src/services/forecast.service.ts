import { api } from '@/lib/api/api';
import { ForecastResult } from '@/types/forecast';

export const forecastService = {
  async get24h(stationCode: string): Promise<ForecastResult> {
    return api.get<ForecastResult>(`/forecast/24h?station=${stationCode}`);
  },

  async get48h(stationCode: string): Promise<ForecastResult> {
    return api.get<ForecastResult>(`/forecast/48h?station=${stationCode}`);
  },

  async get72h(stationCode: string): Promise<ForecastResult> {
    return api.get<ForecastResult>(`/forecast/72h?station=${stationCode}`);
  },
};
