import { AxiosInstance, AxiosError } from 'axios';

export function setupInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use(
    (config) => {
      // Config setup if needed (e.g. auth headers)
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as any;

      // Handle retries
      if (!config || !config.retry) {
        return Promise.reject(error);
      }

      config.retryCount = config.retryCount || 0;

      if (config.retryCount >= config.retry) {
        return Promise.reject(error);
      }

      config.retryCount += 1;

      const delay = new Promise<void>((resolve) => {
        setTimeout(() => resolve(), config.retryDelay || 1000);
      });

      await delay;
      return instance(config);
    }
  );
}
