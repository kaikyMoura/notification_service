import { Inject, Injectable } from '@nestjs/common';
import { AbstractEventListener } from 'src/domain/abstracts/abstract-event.listener';
import { NotificationEventUnion } from 'src/domain/interfaces/notification-event.interface';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';

/**
 * @class NotificationLoggerListener
 * @description Listener for logging notification events
 */
@Injectable()
export class NotificationLoggerListener extends AbstractEventListener {
  constructor(@Inject(LOGGER_SERVICE) logger: ILoggerService) {
    super(
      {
        name: 'NotificationLoggerListener',
        eventTypes: [
          'notification.sent',
          'notification.failed',
          'notification.queued',
          'welcome.email.sent',
          'verification.code.sent',
          'verification.code.verified',
        ],
        priority: 1,
      },
      logger,
    );
  }

  /**
   * Process notification event
   * @param event - The notification event
   * @returns Promise<void>
   */
  async processEvent(event: NotificationEventUnion): Promise<void> {
    const logMessage = this.formatLogMessage(event);

    switch (event.eventType) {
      case 'notification.sent':
        this.logger.log(logMessage);
        break;

      case 'notification.failed':
        this.logger.error(logMessage);
        break;

      case 'notification.queued':
        this.logger.debug(logMessage);
        break;

      case 'welcome.email.sent':
        this.logger.log(logMessage);
        break;

      case 'verification.code.sent':
        this.logger.log(logMessage);
        break;

      case 'verification.code.verified':
        this.logger.log(logMessage);
        break;

      default:
        this.logger.warn(`Unknown event type: ${(event as NotificationEventUnion).eventType}`);
    }
  }

  /**
   * Format log message based on event type
   * @param event - The notification event
   * @returns string
   */
  private formatLogMessage(event: NotificationEventUnion): string {
    const baseInfo = `User: ${event.userId}, Channel: ${event.channel}, Type: ${event.type}`;

    switch (event.eventType) {
      case 'notification.sent':
        return `✅ Notification sent successfully - ${baseInfo}, Provider: ${event.provider}, DeliveryTime: ${event.deliveryTime}ms`;

      case 'notification.failed':
        return `❌ Notification failed - ${baseInfo}, Error: ${event.error}, RetryCount: ${event.retryCount}/${event.maxRetries}`;

      case 'notification.queued':
        return `📋 Notification queued - ${baseInfo}, QueueId: ${event.queueId}, Priority: ${event.priority}`;

      case 'welcome.email.sent':
        return `🎉 Welcome email sent - ${baseInfo}, Template: ${event.template}, Provider: ${event.provider}`;

      case 'verification.code.sent':
        return `📱 Verification code sent - ${baseInfo}, Phone: ${event.phoneNumber}, ExpiresAt: ${event.expiresAt.toISOString()}`;

      case 'verification.code.verified':
        return `✅ Verification code verified - ${baseInfo}, Phone: ${event.phoneNumber}, VerifiedAt: ${event.verifiedAt.toISOString()}`;

      default:
        return `📝 Event logged - ${baseInfo}, EventType: ${(event as NotificationEventUnion).eventType}`;
    }
  }

  /**
   * Handle processing error
   * @param event - The notification event
   * @param error - The error that occurred
   * @returns Promise<void>
   */
  protected handleError(event: NotificationEventUnion, error: Error): void {
    this.logger.error(
      `Failed to log notification event ${event.eventType} for user ${event.userId}: ${error.message}`,
      error.stack,
    );
  }
}
