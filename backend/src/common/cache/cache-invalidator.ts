import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

const INVALIDATION_CHANNEL = 'cache:invalidate';

@Injectable()
export class CacheInvalidator implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheInvalidator.name);
  private publisher: Redis;

  onModuleInit() {
    this.publisher = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    this.publisher.connect().catch((err) => {
      this.logger.warn(
        `Cache invalidator Redis connection failed: ${err.message}. Writes will skip invalidation.`,
      );
    });
  }

  onModuleDestroy() {
    if (this.publisher) {
      this.publisher.disconnect();
    }
  }

  async invalidate(pattern: string, reason?: string): Promise<void> {
    try {
      const message = JSON.stringify({
        pattern,
        reason: reason || 'manual_invalidation',
        timestamp: Date.now(),
      });
      await this.publisher.publish(INVALIDATION_CHANNEL, message);
      this.logger.log(`Published invalidation for pattern: ${pattern}`);
    } catch (err: any) {
      this.logger.warn(
        `Failed to publish invalidation for ${pattern}: ${err.message}`,
      );
    }
  }
}
