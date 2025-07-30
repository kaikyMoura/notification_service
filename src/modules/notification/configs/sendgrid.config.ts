import { registerAs } from '@nestjs/config';
import * as joi from 'joi';

/**
 * Sendgrid configuration interface
 * @description This is the interface for the sendgrid configuration
 * @returns Sendgrid configuration interface
 */
export interface SendgridConfig {
  SENDGRID_API_KEY: string;
  SENDGRID_SENDER_EMAIL: string;
}

/**
 * Sendgrid configuration
 * @description This is the configuration for the sendgrid module
 * @returns Sendgrid configuration
 */
export const sendgridConfig = registerAs('sendgrid', (): SendgridConfig => {
  const envVars = {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_SENDER_EMAIL: process.env.SENDGRID_SENDER_EMAIL,
  };

  const schema = joi.object<SendgridConfig>({
    SENDGRID_API_KEY: joi.string().required(),
    SENDGRID_SENDER_EMAIL: joi.string().required(),
  });

  const { error, value } = schema.validate(envVars) as {
    error: joi.ValidationError | null;
    value: SendgridConfig;
  };

  if (error) {
    throw new Error(`Sendgrid configuration error: ${error.message}`);
  }

  return value;
});
