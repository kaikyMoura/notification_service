import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { AbstractProvider } from 'src/domain/abstracts/abstract.provider';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { SendgridConfig } from '../configs/sendgrid.config';

@Injectable()
export class SendgridProvider extends AbstractProvider<SendgridConfig> {
  private readonly client: typeof sgMail;

  constructor(configService: ConfigService, @Inject(LOGGER_SERVICE) logger: ILoggerService) {
    super(configService, logger);
    this.client = this.initializeClient();
  }

  protected validateConfig(): SendgridConfig {
    const config = this.configService.get<SendgridConfig>('sendgrid');
    if (!config?.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is required');
    }
    return config;
  }

  protected initializeClient(): typeof sgMail {
    sgMail.setApiKey(this.getConfig().SENDGRID_API_KEY);
    return sgMail;
  }

  getClient(): typeof sgMail {
    return this.client;
  }

  getConfig(): SendgridConfig {
    return this.configService.get<SendgridConfig>('sendgrid')!;
  }
}
