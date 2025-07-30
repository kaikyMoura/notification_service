import { DynamicModule, Module, Provider } from '@nestjs/common';
import { LOGGER_OPTIONS, LOGGER_SERVICE } from './logger.constants';
import { WinstonLoggerService } from './logger.service';

/**
 * Logger module options
 * @description This interface is used to configure the logger module.
 * @param global - Whether the logger service should be global.
 * @param contextPrefix - The context prefix to add to the log messages.
 * @returns Logger module options
 */
export interface LoggerModuleOptions {
  global?: boolean;
  contextPrefix?: string;
  enableConsoleLogs?: boolean;
}

// Re-export tokens for external use
export { LOGGER_OPTIONS, LOGGER_SERVICE };

/**
 * Logger module
 * @description This module is used to provide the logger service.
 * @returns Logger module
 */
@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions = {}): DynamicModule {
    const isGlobal = options.global ?? false;

    const optionsProvider: Provider = {
      provide: LOGGER_OPTIONS,
      useValue: options,
    };

    const loggerProvider: Provider = {
      provide: LOGGER_SERVICE,
      useClass: WinstonLoggerService,
    };

    return {
      module: LoggerModule,
      providers: [optionsProvider, loggerProvider],
      exports: [LOGGER_SERVICE],
      global: isGlobal,
    };
  }
}
