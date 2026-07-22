import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import Redis from 'ioredis';

const INVALIDATION_CHANNEL = 'cache:invalidate';

interface InvalidationMessage {
  pattern: string;
  reason: string;
  timestamp: number;
}

@Injectable()
export class CacheSubscriber implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheSubscriber.name);
  private subscriber: Redis;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  onModuleInit() {
    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.subscriber
      .connect()
      .then(() => {
        this.subscriber.subscribe(INVALIDATION_CHANNEL, (err) => {
          if (err) {
            this.logger.warn(
              `Failed to subscribe to ${INVALIDATION_CHANNEL}: ${err.message}`,
            );
            return;
          }
          this.logger.log(
            `Listening for cache invalidation on ${INVALIDATION_CHANNEL}`,
          );
        });

        this.subscriber.on(
          'message',
          async (channel: string, rawMessage: string) => {
            if (channel !== INVALIDATION_CHANNEL) return;

            try {
              const msg: InvalidationMessage = JSON.parse(rawMessage);
              const keys: string[] = [];
              let cursor = '0';
              do {
                const [nextCursor, found] = await this.subscriber.scan(
                  cursor,
                  'MATCH',
                  msg.pattern,
                  'COUNT',
                  '100',
                );
                cursor = nextCursor;
                keys.push(...found);
              } while (cursor !== '0');

              if (keys.length > 0) {
                await this.subscriber.del(...keys);
                this.logger.log(
                  `Invalidated ${keys.length} keys matching ${msg.pattern} (${msg.reason})`,
                );
              } else {
                this.logger.log(
                  `No keys matched pattern: ${msg.pattern} (${msg.reason})`,
                );
              }
            } catch (err: any) {
              this.logger.warn(
                `Failed to process invalidation message: ${err.message}`,
              );
            }
          },
        );
      })
      .catch((err) => {
        this.logger.warn(
          `Cache subscriber Redis connection failed: ${err.message}. Cache will not auto-invalidate.`,
        );
      });
  }

  async onModuleDestroy() {
    if (this.subscriber) {
      await this.subscriber.unsubscribe(INVALIDATION_CHANNEL);
      this.subscriber.disconnect();
    }
  }
}
