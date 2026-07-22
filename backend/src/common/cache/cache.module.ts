import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheInvalidator } from './cache-invalidator';
import { CacheSubscriber } from './cache-subscriber';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: () => ({
        ttl: 60_000,
      }),
    }),
  ],
  providers: [CacheInvalidator, CacheSubscriber],
  exports: [NestCacheModule, CacheInvalidator, CacheSubscriber],
})
export class CacheModule {}
