import { api } from '@/lib/api/api';
import { Intervention, InterventionDashboardMetrics } from '@/types/intervention';

export const interventionService = {
  async getAll(city?: string): Promise<Intervention[]> {
    const params = city ? { city } : undefined;
    return api.get<Intervention[]>('/interventions', { params });
  },

  async getDashboard(city?: string): Promise<InterventionDashboardMetrics> {
    const params = city ? { city } : undefined;
    return api.get<InterventionDashboardMetrics>('/interventions/dashboard', { params });
  },

  async generate(): Promise<Intervention[]> {
    return api.post<Intervention[]>('/interventions/generate');
  },
};
