import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Points to NestJS backend
  timeout: 10000,
});

export const fetchDashboardMetrics = async () => {
  const { data } = await api.get('/interventions/dashboard');
  return data.data; // Unwrap the backend interceptor
};

export const fetchStations = async () => {
  const { data } = await api.get('/stations');
  return data.data;
};

export const fetchLiveAqi = async () => {
  const { data } = await api.get('/aqi/live');
  return data.data;
};

export const fetchInterventions = async () => {
  const { data } = await api.get('/interventions');
  return data.data;
};

export const fetchRecommendations = async () => {
  const { data } = await api.get('/recommendations');
  return data.data;
};

export const fetchHotspots = async () => {
  const { data } = await api.get('/hotspots');
  return data.data;
};

export default api;
