import { api } from '@/lib/api/api';
import { Station } from '@/types/station';

export const stationService = {
  async getAll(city?: string): Promise<Station[]> {
    const params = city ? { city } : undefined;
    return api.get<Station[]>('/stations', { params });
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
