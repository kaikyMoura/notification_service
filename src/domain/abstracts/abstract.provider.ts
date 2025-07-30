import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';

/**
 * @abstract AbstractProvider
 * @description Base class for providers
 */
export abstract class AbstractProvider<T> {
  protected config: T;

  constructor(
    protected readonly configService: ConfigService,
    @Inject(LOGGER_SERVICE) protected readonly logger: ILoggerService,
  ) {
    this.config = this.validateConfig();
  }

  /**
   * @abstract validateConfig
   * @description Validate configuration - must be implemented by subclasses
   */
  protected abstract validateConfig(): T;

  /**
   * @abstract initializeClient
   * @description Initialize client - must be implemented by subclasses
   */
  protected abstract initializeClient(): any;

  /**
   * @protected getConfigFromService
   * @description Common method to get configuration from ConfigService
   */
  protected getConfigFromService<T>(key: string): T {
    const config = this.configService.get<T>(key);
    if (!config) {
      this.logger.error(`Configuration for ${key} is missing`, 'AbstractProvider.getConfigFromService');
      throw new Error(`Configuration for ${key} is missing`);
    }
    return config;
  }

  /**
   * @protected validateRequiredEnvVar
   * @description Common validation for required environment variables
   */
  protected validateRequiredEnvVar(value: string | undefined, name: string): string {
    if (!value) {
      this.logger.error(`${name} is required`, 'AbstractProvider.validateRequiredEnvVar');
      throw new Error(`${name} is required`);
    }
    return value;
  }
}
