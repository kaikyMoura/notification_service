import { Inject } from '@nestjs/common';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { NotificationEventUnion } from '../interfaces/notification-event.interface';
import { NotificationListenerOptions } from '../interfaces/notification-listener.interface';

/**
 * @class AbstractEventListener
 * @description Abstract class for event listeners
 */
export abstract class AbstractEventListener {
  /**
   * @property name
   * @description The name of the listener
   */
  protected readonly name: string;

  /**
   * @property eventTypes
   * @description The types of events this listener is interested in
   */
  protected readonly eventTypes: string[];

  /**
   * @property enabled
   * @description Whether the listener is enabled
   */
  protected enabled: boolean;

  /**
   * @property priority
   * @description The priority of the listener
   */
  protected readonly priority: number;

  /**
   * @property retryAttempts
   * @description The number of retry attempts
   */
  protected readonly retryAttempts: number;

  /**
   * @property retryDelay
   * @description The delay between retry attempts
   */
  protected readonly retryDelay: number;

  constructor(
    options: NotificationListenerOptions,
    @Inject(LOGGER_SERVICE) protected readonly logger: ILoggerService,
  ) {
    this.name = options.name;
    this.eventTypes = options.eventTypes;
    this.enabled = options.enabled ?? true;
    this.priority = options.priority ?? 0;
    this.retryAttempts = options.retryAttempts ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
  }

  /**
   * Handle notification event with retry logic
   * @param event - The notification event
   * @returns Promise<void>
   */
  async handle(event: NotificationEventUnion): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    if (!this.eventTypes.includes(event.eventType)) {
      return;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.processEvent(event);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    // All retries failed
    this.handleError(event, lastError!);
  }

  /**
   * Process the notification event (to be implemented by subclasses)
   * @param event - The notification event
   * @returns Promise<void>
   */
  protected abstract processEvent(event: NotificationEventUnion): Promise<void>;

  /**
   * Handle processing error (can be overridden by subclasses)
   * @param event - The notification event
   * @param error - The error that occurred
   */
  protected handleError(event: NotificationEventUnion, error: Error): void {
    // Default error handling - can be overridden
    this.logger.error(
      `Listener ${this.name} failed to process event ${event.eventType}: ${error.message}`,
      'AbstractEventListener.handleError',
      {
        stack: error.stack,
      },
    );
  }

  /**
   * Get listener name
   * @returns string
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get event types this listener is interested in
   * @returns string[]
   */
  getEventTypes(): string[] {
    return this.eventTypes;
  }

  /**
   * Check if listener is enabled
   * @returns boolean
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable the listener
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable the listener
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Get listener priority
   * @returns number
   */
  getPriority(): number {
    return this.priority;
  }

  /**
   * Delay execution for specified milliseconds
   * @param ms - Milliseconds to delay
   * @returns Promise<void>
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
