import { api } from '@/lib/api/api';
import { Recommendation } from '@/types/recommendation';

export const recommendationService = {
  async getAll(city?: string): Promise<Recommendation[]> {
    const params = city ? { city } : undefined;
    return api.get<Recommendation[]>('/recommendations', { params });
  },
};
