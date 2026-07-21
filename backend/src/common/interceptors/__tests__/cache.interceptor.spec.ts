import { CacheInterceptor } from '../cache.interceptor';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('CacheInterceptor', () => {
  let interceptor: CacheInterceptor;
  let mockCacheManager: any;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    interceptor = new CacheInterceptor(mockCacheManager);

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/test', method: 'GET' }),
      }),
      getClass: () => ({ name: 'TestController' }),
      getHandler: () => ({ name: 'testMethod' }),
    } as any;

    mockCallHandler = {
      handle: () => of({ data: 'test-response' }),
    } as any;
  });

  it('should return cached data on cache hit', (done) => {
    mockCacheManager.get.mockResolvedValue({ data: 'cached' });
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({ data: 'cached' });
        expect(mockCacheManager.get).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should call handler and cache on cache miss', (done) => {
    mockCacheManager.get.mockResolvedValue(null);
    mockCacheManager.set.mockResolvedValue(undefined);

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({ data: 'test-response' });
        expect(mockCacheManager.set).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should fall through on Redis failure (circuit breaker)', (done) => {
    mockCacheManager.get.mockRejectedValue(new Error('Redis connection refused'));
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({ data: 'test-response' });
        done();
      }
    });
  });
});
