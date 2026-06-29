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

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const API_URL = (envApiUrl && envApiUrl.trim() !== "") ? envApiUrl : 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:3001',
  timeout: 15000,
});

apiClient.defaults.retry = 3;
apiClient.defaults.retryDelay = 1000;

setupInterceptors(apiClient);
