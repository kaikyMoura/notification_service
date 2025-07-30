import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AbstractEventListener } from 'src/domain/abstracts/abstract-event.listener';
import { NotificationEventUnion, NotificationSentEvent } from 'src/domain/interfaces/notification-event.interface';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { NotificationMetricsProvider } from 'src/infrastructure/metrics/providers/notification.metrics.provider';

@Injectable()
export class NotificationMetricsListener extends AbstractEventListener implements OnModuleInit {
  private readonly deliveryTimes: number[] = [];

  constructor(
    @Inject(LOGGER_SERVICE) logger: ILoggerService,
    private readonly notificationMetrics: NotificationMetricsProvider,
  ) {
    super(
      {
        name: 'NotificationMetricsListener',
        eventTypes: [
          'notification.sent',
          'notification.failed',
          'notification.queued',
          'welcome.email.sent',
          'verification.code.sent',
          'verification.code.verified',
        ],
      },
      logger,
    );
  }

  onModuleInit(): void {
    this.logger.info('NotificationMetricsListener initialized', 'NotificationMetricsListener.onModuleInit');
  }

  async processEvent(event: NotificationEventUnion): Promise<void> {
    try {
      switch (event.eventType) {
        case 'notification.sent':
          this.notificationMetrics.incrementSentCount();
          if (event.deliveryTime) {
            this.deliveryTimes.push(event.deliveryTime);
            this.updateAverageDeliveryTime();
          }
          break;

        case 'notification.failed':
          this.notificationMetrics.incrementFailedCount();
          break;

        case 'notification.queued':
          // Note: totalQueued metric is not available in the provider, so we'll skip this for now
          break;

        case 'welcome.email.sent':
          // Note: welcomeEmailsSent metric is not available in the provider, so we'll skip this for now
          break;

        case 'verification.code.sent':
          // Note: verificationCodesSent metric is not available in the provider, so we'll skip this for now
          break;

        case 'verification.code.verified':
          // Note: verificationCodesVerified metric is not available in the provider, so we'll skip this for now
          break;
      }

      await this.updateSuccessRate();

      this.logger.debug(`Metrics updated for event: ${event.eventType}`, 'NotificationMetricsListener.processEvent');
    } catch (error) {
      this.handleError(event, error);
    }
  }

  private updateAverageDeliveryTime(): void {
    const avg =
      this.deliveryTimes.length > 0 ? this.deliveryTimes.reduce((acc, t) => acc + t, 0) / this.deliveryTimes.length : 0;

    this.notificationMetrics.observeNotificationDuration(avg);
  }

  private async updateSuccessRate(): Promise<void> {
    // Note: success rate calculation is simplified since we don't have direct access to the metrics
    // The provider handles this internally
  }

  private getLabels(event: NotificationEventUnion): Record<string, string> {
    return {
      channel: event.channel ?? 'unknown',
      type: event.type ?? 'unknown',
      provider: (event as NotificationSentEvent).provider ?? 'unknown',
    };
  }

  protected handleError(event: NotificationEventUnion, error: Error): void {
    this.logger.error(
      `Failed to process event ${event.eventType}: ${error.message}`,
      'NotificationMetricsListener.handleError',
    );
  }
}
