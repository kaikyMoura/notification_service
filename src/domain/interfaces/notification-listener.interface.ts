import { BusinessEventUnion } from './business-event.interface';
import { NotificationEventUnion } from './notification-event.interface';

/**
 * @interface NotificationListener
 * @description Interface for notification event listeners
 */
export interface NotificationListener {
  /**
   * Handle notification event
   * @param event - The notification event
   * @returns Promise<void>
   */
  handle(event: NotificationEventUnion): Promise<void>;

  /**
   * Handle business event
   * @param event - The business event
   * @returns Promise<void>
   */
  handleBusinessEvent(event: BusinessEventUnion): Promise<void>;

  /**
   * Enable listener
   */
  enable(): void;

  /**
   * Disable listener
   */
  disable(): void;

  /**
   * Get listener name for identification
   * @returns string
   */
  getName(): string;

  /**
   * Get event types this listener is interested in
   * @returns string[]
   */
  getEventTypes(): string[];

  /**
   * Check if listener is enabled
   * @returns boolean
   */
  isEnabled(): boolean;

  /**
   * Get listener priority
   * @returns number
   */
  getPriority(): number;
}

/**
 * @interface NotificationListenerOptions
 * @description Options for notification listeners
 */
export interface NotificationListenerOptions {
  name: string;
  eventTypes: string[];
  enabled?: boolean;
  priority?: number;
  retryAttempts?: number;
  retryDelay?: number;
}
