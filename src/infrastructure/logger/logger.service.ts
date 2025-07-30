import { Inject, Injectable, Optional } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import { ILoggerService } from './interfaces/logger.service.interface';
import { LOGGER_OPTIONS } from './logger.constants';
import { LoggerModuleOptions } from './logger.module';

/**
 * Logger service
 * @description This service is used to log messages to the console and to files.
 * @returns Logger service
 */
@Injectable()
export class WinstonLoggerService implements ILoggerService {
  private readonly contextPrefix?: string;
  private readonly logger: Logger;

  constructor(@Optional() @Inject(LOGGER_OPTIONS) options?: LoggerModuleOptions) {
    this.contextPrefix = options?.contextPrefix;
    const transportsList: any[] = [
      new transports.File({ filename: 'logs/error.log' }),
      new transports.File({ filename: 'logs/combined.log' }),
    ];

    if (options?.enableConsoleLogs) {
      transportsList.push(
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf((info: any) => {
              const prefix = this.contextPrefix ? `[${this.contextPrefix}]` : '';
              const contextStr = info.context ? ` [${String(info.context)}]` : '';
              return `${info.timestamp} ${prefix}${contextStr} ${info.level}: ${info.message}`;
            }),
          ),
        }),
      );
    }

    this.logger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: transportsList,
    });
  }

  log(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info({
      message,
      context: this.contextPrefix ? `${this.contextPrefix} - ${context}` : context,
      meta,
    });
  }

  info(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info({
      message,
      context: this.contextPrefix ? `${this.contextPrefix} - ${context}` : context,
      meta,
    });
  }

  error(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.error({
      message,
      context: this.contextPrefix ? `${this.contextPrefix} - ${context}` : context,
      meta,
    });
  }

  warn(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.warn({
      message,
      context: this.contextPrefix ? `${this.contextPrefix} - ${context}` : context,
      meta,
    });
  }

  debug(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.debug({
      message,
      context: this.contextPrefix ? `${this.contextPrefix} - ${context}` : context,
      meta,
    });
  }

  audit(data: Record<string, any>, context?: string, meta?: Record<string, any>) {
    this.info('Audit', context, { ...meta, data });
  }
}
