import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: () => ({
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        store: require('cache-manager-ioredis'),
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        ttl: 60,
      }),
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
