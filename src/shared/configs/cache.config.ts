import { registerAs } from '@nestjs/config';
import * as joi from 'joi';

/**
 * Cache configuration interface
 * @description This is the interface for the cache configuration
 */
export interface CacheConfig {
  REDIS_URL: string;
  REDIS_TTL: number;
  REDIS_MAX_ITEMS: number;
}

/**
 * Cache configuration
 * @description This is the configuration for the cache module
 * @returns Cache configuration
 */
export const cacheConfig = registerAs('cache', (): CacheConfig => {
  const envVars = {
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TTL: Number(process.env.REDIS_TTL),
    REDIS_MAX_ITEMS: Number(process.env.REDIS_MAX_ITEMS),
  };

  const schema = joi.object<CacheConfig>({
    REDIS_URL: joi.string().uri().required(),
    REDIS_TTL: joi.number().integer().positive().required(),
    REDIS_MAX_ITEMS: joi.number().integer().min(1).max(1000).required(),
  });

  const { error, value } = schema.validate(envVars, {
    abortEarly: false,
    allowUnknown: true,
  }) as {
    error: joi.ValidationError;
    value: CacheConfig;
  };

  if (error) {
    throw new Error(`Cache configuration error: ${error.message}`);
  }

  return value;
});
