import axios from 'axios';
import { setupInterceptors } from './interceptors';

// Extend AxiosRequestConfig type definition for retry properties
declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
    retryCount?: number;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

apiClient.defaults.retry = 3;
apiClient.defaults.retryDelay = 1000;

setupInterceptors(apiClient);
