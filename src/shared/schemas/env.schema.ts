import * as Joi from 'joi';

/**
 * Joi validation schema
 * @description This is the validation schema for the environment variables
 * @returns Joi validation schema
 */
export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Application environment'),
  PORT: Joi.number().default(5000).description('Port where the server will listen'),
  DATABASE_URL: Joi.string().uri().required().description('Database connection URL'),
  REDIS_URL: Joi.string().uri().allow('').default('').description('Redis connection URL, optional'),
  REDIS_TTL: Joi.number().default(300).description('Redis cache item TTL in seconds'),
  REDIS_MAX_ITEMS: Joi.number().default(100).description('Maximum number of items stored in Redis cache'),
  THROTTLER_TTL: Joi.number().default(60).description('Throttler TTL in seconds'),
  THROTTLER_LIMIT: Joi.number().default(10).description('Throttler limit'),
  ALLOWED_ORIGINS: Joi.string()
    .default('http://localhost:3000')
    .description('Comma-separated list of allowed CORS origins'),
});
