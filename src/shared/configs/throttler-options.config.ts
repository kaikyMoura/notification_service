import { ConfigModule, ConfigType } from '@nestjs/config';
import { ThrottlerAsyncOptions, ThrottlerModuleOptions } from '@nestjs/throttler';
import { throttlerConfig } from './throttler.config';

/**
 * Throttler module options
 * @description This is the configuration for the throttler module
 * @returns Throttler module options
 */
export const throttlerModuleOptions: ThrottlerAsyncOptions = {
  imports: [ConfigModule],
  inject: [throttlerConfig.KEY],
  useFactory: (config: ConfigType<typeof throttlerConfig>): ThrottlerModuleOptions => {
    return {
      throttlers: [
        {
          ttl: config.THROTTLER_TTL,
          limit: config.THROTTLER_LIMIT,
        },
      ],
    };
  },
};
