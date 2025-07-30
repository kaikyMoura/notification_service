import { registerAs } from '@nestjs/config';
import * as joi from 'joi';

/**
 * Database configuration interface
 * @description This is the interface for the database configuration
 * @returns Database configuration interface
 */
export interface DatabaseConfig {
  DATABASE_URL: string;
}

/**
 * Database configuration
 * @description This is the configuration for the database module
 * @returns Database configuration
 */
export const databaseConfig = registerAs('database', (): DatabaseConfig => {
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL,
  };

  const schema = joi.object<DatabaseConfig>({
    DATABASE_URL: joi.string().uri().required(),
  });

  const { error, value } = schema.validate(envVars, {
    abortEarly: false,
    allowUnknown: true,
  }) as {
    error: joi.ValidationError;
    value: DatabaseConfig;
  };

  if (error) {
    throw new Error(`Database configuration error: ${error.message}`);
  }

  return value;
});
