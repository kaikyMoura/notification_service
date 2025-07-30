import { registerAs } from '@nestjs/config';
import * as joi from 'joi';

/**
 * Twilio configuration interface
 * @description This is the interface for the twilio configuration
 * @returns Twilio configuration interface
 */
export interface TwilioConfig {
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_VERIFY_SERVICE_SID: string;
  TWILIO_PHONE_NUMBER: string;
}

/**
 * Twilio configuration
 * @description This is the configuration for the twilio module
 * @returns Twilio configuration
 */
export const twilioConfig = registerAs('twilio', (): TwilioConfig => {
  const envVars = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  };

  const schema = joi.object<TwilioConfig>({
    TWILIO_ACCOUNT_SID: joi.string().required(),
    TWILIO_AUTH_TOKEN: joi.string().required(),
    TWILIO_VERIFY_SERVICE_SID: joi.string().required(),
    TWILIO_PHONE_NUMBER: joi.string().required(),
  });

  const { error, value } = schema.validate(envVars) as {
    error: joi.ValidationError | null;
    value: TwilioConfig;
  };

  if (error) {
    throw new Error(`Twilio configuration error: ${error.message}`);
  }

  return value;
});
