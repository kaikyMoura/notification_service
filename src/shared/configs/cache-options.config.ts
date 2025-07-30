import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigType } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { cacheConfig } from './cache.config';

/**
 * Create cache module options
 * @description This is the function to create the cache module options
 * @returns Cache module options
 */
export const cacheModuleOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  inject: [cacheConfig.KEY],
  useFactory: (config: ConfigType<typeof cacheConfig>) => {
    const useRedis = Boolean(config.REDIS_URL);
    const store = useRedis ? new KeyvRedis(config.REDIS_URL, { connectionTimeout: 1000 }) : undefined;

    return {
      store,
      ttl: config.REDIS_TTL,
      max: config.REDIS_MAX_ITEMS,
    };
  },
};
