/**
 * Logger service interface.
 * @description This interface defines a contract for a logger service.
 * @interface ILoggerService
 */
export interface ILoggerService {
  /**
   * Log a message.
   * @param message - The message to log.
   * @param context - The context of the message.
   * @param meta - The meta data to log.
   */
  log(message: string, context?: string, meta?: Record<string, any>): void;
  /**
   * Log an info message.
   * @param message - The message to log.
   * @param context - The context of the message.
   * @param meta - The meta data to log.
   */
  info(message: string, context?: string, meta?: Record<string, any>): void;
  /**
   * Log an error message.
   * @param message - The message to log.
   * @param context - The context of the message.
   * @param meta - The meta data to log.
   */
  error(message: string, context?: string, meta?: Record<string, any>): void;
  /**
   * Log a warning message.
   * @param message - The message to log.
   * @param context - The context of the message.
   * @param meta - The meta data to log.
   */
  warn(message: string, context?: string, meta?: Record<string, any>): void;
  /**
   * Log a debug message.
   * @param message - The message to log.
   * @param context - The context of the message.
   * @param meta - The meta data to log.
   */
  debug(message: string, context?: string, meta?: Record<string, any>): void;
}
