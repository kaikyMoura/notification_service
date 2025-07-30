import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbstractProvider } from 'src/domain/abstracts/abstract.provider';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { Twilio } from 'twilio';
import { TwilioConfig } from '../configs/twilio.config';

@Injectable()
export class TwilioProvider extends AbstractProvider<TwilioConfig> {
  private readonly client: Twilio;
  private readonly verifySid: string;

  constructor(configService: ConfigService, @Inject(LOGGER_SERVICE) logger: ILoggerService) {
    super(configService, logger);
    this.client = this.initializeClient();
    this.verifySid = this.getConfig().TWILIO_VERIFY_SERVICE_SID!;
  }

  protected validateConfig(): TwilioConfig {
    const config = this.configService.get<TwilioConfig>('twilio');
    if (!config?.TWILIO_ACCOUNT_SID || !config?.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio configuration is missing or incomplete');
    }
    return config;
  }

  protected initializeClient(): Twilio {
    return new Twilio(this.getConfig().TWILIO_ACCOUNT_SID, this.getConfig().TWILIO_AUTH_TOKEN);
  }

  getClient(): Twilio {
    return this.client;
  }

  getConfig(): TwilioConfig {
    return this.configService.get<TwilioConfig>('twilio')!;
  }
}
