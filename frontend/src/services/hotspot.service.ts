import { api } from '@/lib/api/api';
import { Hotspot } from '@/types/hotspot';

export const hotspotService = {
  async getAll(city?: string): Promise<Hotspot[]> {
    const params = city ? { city } : undefined;
    return api.get<Hotspot[]>('/hotspots', { params });
  },
};
