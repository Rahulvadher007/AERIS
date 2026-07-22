import { api } from '@/lib/api/api';
import { Hotspot } from '@/types/hotspot';

interface PaginatedHotspots {
  data: Hotspot[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const hotspotService = {
  async getAll(city?: string): Promise<Hotspot[]> {
    const params = city ? { city } : undefined;
    const result = await api.get<PaginatedHotspots>('/hotspots', { params });
    return result.data;
  },
};
