import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupInterceptors } from '../interceptors';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('setupInterceptors', () => {
  let instance: ReturnType<typeof axios.create>;
  let mock: MockAdapter;

  beforeEach(() => {
    instance = axios.create({ baseURL: '/api' });
    mock = new MockAdapter(instance);
    setupInterceptors(instance);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should retry 3 times on 5xx with increasing delays', async () => {
    const spy = vi.fn();
    mock.onGet('/test').reply(() => {
      spy();
      return [502, 'Bad Gateway'];
    });

    await expect(instance.get('/test')).rejects.toThrow();
    expect(spy).toHaveBeenCalledTimes(4);
  }, 15000);

  it('should not retry on 4xx', async () => {
    const spy = vi.fn();
    mock.onGet('/test').reply(() => {
      spy();
      return [400, 'Bad Request'];
    });

    await expect(instance.get('/test')).rejects.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should succeed after retry on transient error', async () => {
    let attempts = 0;
    mock.onGet('/test').reply(() => {
      attempts++;
      if (attempts < 3) return [502, 'Bad Gateway'];
      return [200, { data: 'ok' }];
    });

    const response = await instance.get('/test');
    expect(response.data).toEqual({ data: 'ok' });
    expect(attempts).toBe(3);
  });
});
