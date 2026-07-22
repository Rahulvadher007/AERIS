import { api } from '@/lib/api/api';
import { Station } from '@/types/station';

interface PaginatedStations {
  data: Station[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const stationService = {
  async getAll(city?: string): Promise<Station[]> {
    const params = city ? { city } : undefined;
    const result = await api.get<PaginatedStations>('/stations', { params });
    return result.data;
  },

  async getCities(): Promise<string[]> {
    return api.get<string[]>('/stations/cities');
  },

  async getById(id: string): Promise<Station> {
    return api.get<Station>(`/stations/${id}`);
  },

  async create(data: Omit<Station, 'id' | 'createdAt' | 'updatedAt'>): Promise<Station> {
    return api.post<Station>('/stations', data);
  },

  async update(id: string, data: Partial<Omit<Station, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Station> {
    return api.patch<Station>(`/stations/${id}`, data);
  },

  async delete(id: string): Promise<Station> {
    return api.delete<Station>(`/stations/${id}`);
  },
};
