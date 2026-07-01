import { apiClient } from './axios';
import { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types/api';

export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    if (typeof response.data === 'string') {
      console.warn(`[API GET] Received string (HTML?) instead of JSON from ${url}`);
      return ([] as unknown) as T;
    }
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    console.warn(`[API GET] Missing .data on response from ${url}:`, response.data);
    return (response.data as unknown) as T ?? ([] as unknown as T);
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    if (typeof response.data === 'string') return ({} as unknown) as T;
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return (response.data as unknown) as T ?? ({} as unknown as T);
  },

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    if (typeof response.data === 'string') return ({} as unknown) as T;
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return (response.data as unknown) as T ?? ({} as unknown as T);
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    if (typeof response.data === 'string') return ({} as unknown) as T;
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return (response.data as unknown) as T ?? ({} as unknown as T);
  },
};
export default api;
