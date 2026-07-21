import { Injectable, Inject, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RESET_MS = 60000;

@Injectable()
export class CacheInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  private consecutiveFailures = 0;
  private circuitOpenUntil = 0;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.buildCacheKey(context);
    const ttl = this.getTTL(context);

    if (this.isCircuitOpen()) {
      this.logger.warn(`Cache circuit OPEN for ${cacheKey}, skipping cache`);
      return next.handle();
    }

    return new Observable((observer) => {
      this.cacheManager.get(cacheKey).then((cached) => {
        if (cached !== null && cached !== undefined) {
          this.consecutiveFailures = 0;
          this.logger.log(`Cache HIT: ${cacheKey}`);
          observer.next(cached);
          observer.complete();
          return;
        }

        this.logger.log(`Cache MISS: ${cacheKey}`);
        next.handle().pipe(
          tap((response) => {
            this.cacheManager.set(cacheKey, response, ttl).then(() => {
              this.consecutiveFailures = 0;
            }).catch((err) => {
              this.recordFailure(cacheKey, err);
            });
          }),
        ).subscribe({
          next: (data) => { observer.next(data); observer.complete(); },
          error: (err) => { observer.error(err); },
        });
      }).catch((err) => {
        this.recordFailure(cacheKey, err);
        next.handle().subscribe({
          next: (data) => { observer.next(data); observer.complete(); },
          error: (err2) => { observer.error(err2); },
        });
      });
    });
  }

  private buildCacheKey(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const query = JSON.stringify(request.query || {});
    return `${controller}:${handler}:${request.url}:${query}`;
  }

  private getTTL(context: ExecutionContext): number {
    const handler = context.getHandler().name;
    const ttlMap: Record<string, number> = {
      findAll: 300,
      findCities: 300,
      findLive: 30,
      findStatistics: 300,
      findLatest: 60,
      findHistory: 60,
    };
    return ttlMap[handler] || 60;
  }

  private isCircuitOpen(): boolean {
    if (this.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      if (Date.now() < this.circuitOpenUntil) {
        return true;
      }
      this.consecutiveFailures = 0;
      this.logger.log('Cache circuit RESET, retrying Redis');
    }
    return false;
  }

  private recordFailure(cacheKey: string, err: any) {
    this.consecutiveFailures++;
    if (this.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      this.circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_RESET_MS;
      this.logger.warn(`Cache circuit OPEN after ${CIRCUIT_BREAKER_THRESHOLD} failures (${cacheKey}): ${err.message}`);
    } else {
      this.logger.warn(`Cache failure #${this.consecutiveFailures} for ${cacheKey}: ${err.message}`);
    }
  }
}
