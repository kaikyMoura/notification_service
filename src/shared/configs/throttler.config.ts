import { registerAs } from '@nestjs/config';
import * as joi from 'joi';

export interface ThrottlerConfig {
  THROTTLER_TTL: number;
  THROTTLER_LIMIT: number;
}

/**
 * Throttler configuration
 * @description This is the configuration for the throttler module
 * @returns Throttler configuration
 */
export const throttlerConfig = registerAs('throttler', (): ThrottlerConfig => {
  const envVars = {
    THROTTLER_TTL: Number(process.env.THROTTLER_TTL),
    THROTTLER_LIMIT: Number(process.env.THROTTLER_LIMIT),
  };

  const schema = joi.object<ThrottlerConfig>({
    THROTTLER_TTL: joi.number().required(),
    THROTTLER_LIMIT: joi.number().required(),
  });

  const { error, value } = schema.validate(envVars, {
    abortEarly: false,
    allowUnknown: true,
  }) as {
    error: joi.ValidationError;
    value: ThrottlerConfig;
  };

  if (error) {
    throw new Error(`Throttler configuration error: ${error.message}`);
  }

  return value;
});
