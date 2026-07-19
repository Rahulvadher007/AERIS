import { api } from '@/lib/api/api';

export interface Evidence {
  rmseVsPersistence?: number | string;
  attributionConfidenceAvg?: number;
  signalToInterventionMins?: number;
  multiCityCount?: number;
}

export const evidenceService = {
  get: () => api.get<Evidence>('/evidence'),
};
