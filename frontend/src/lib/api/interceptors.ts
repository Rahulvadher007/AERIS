import { AxiosInstance, AxiosError } from 'axios';

const MAX_RETRIES = 3;
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

function isRetryable(error: AxiosError): boolean {
  if (!error.response) return true;
  return RETRYABLE_STATUS_CODES.includes(error.response.status);
}

function getDelay(retryCount: number): number {
  return Math.pow(2, retryCount - 1) * 1000;
}

export function setupInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use(
    (config) => {
      if ((config as any).retryCount === undefined) {
        (config as any).retryCount = 0;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;

      if (!config || config.retryCount >= MAX_RETRIES) {
        return Promise.reject(error);
      }

      if (!isRetryable(error)) {
        return Promise.reject(error);
      }

      config.retryCount = (config.retryCount || 0) + 1;
      const delay = getDelay(config.retryCount);

      await new Promise((resolve) => setTimeout(resolve, delay));
      return instance(config);
    }
  );
}
