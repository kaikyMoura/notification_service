import { Inject, Injectable } from '@nestjs/common';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { NotificationMetricsProvider } from '../providers/notification.metrics.provider';
import { SystemMetricsProvider } from '../providers/system.metrics.provider';

/**
 * @class MetricsService
 * @description Service for managing metrics
 */
@Injectable()
export class MetricsService {
  constructor(
    private readonly notificationMetricsProvider: NotificationMetricsProvider,
    private readonly systemMetricsProvider: SystemMetricsProvider,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {}

  /**
   * Get notification metrics
   * @returns Promise<string>
   */
  getNotificationMetrics(): Promise<string> {
    this.logger.log('Getting notification metrics', 'MetricsService.getNotificationMetrics');
    return this.notificationMetricsProvider.getMetrics();
  }

  /**
   * Get system metrics
   * @returns Promise<string>
   */
  getSystemMetrics(): Promise<string> {
    this.logger.log('Getting system metrics', 'MetricsService.getSystemMetrics');
    return this.systemMetricsProvider.getMetrics();
  }

  /**
   * Get all metrics
   * @returns Promise<Record<string, any>>
   */
  getAllMetrics(): Promise<Record<string, any>> {
    this.logger.log('Getting all metrics', 'MetricsService.getAllMetrics');
    return Promise.all([this.getNotificationMetrics(), this.getSystemMetrics()]);
  }

  /**
   * Get notification metrics summary
   * @returns Promise<Record<string, any>>
   */
  getNotificationMetricsSummary(): Promise<Record<string, any>> {
    this.logger.log('Getting notification metrics summary', 'MetricsService.getNotificationMetricsSummary');
    return this.notificationMetricsProvider.getMetricsSummary();
  }

  /**
   * Get system metrics summary
   * @returns Promise<Record<string, any>>
   */
  getSystemMetricsSummary(): Promise<Record<string, any>> {
    this.logger.log('Getting system metrics summary', 'MetricsService.getSystemMetricsSummary');
    return this.systemMetricsProvider.getMetricsSummary();
  }

  /**
   * Get metrics summary
   * @returns Promise<Record<string, any>>
   */
  getMetricsSummary(): Promise<Record<string, any>> {
    this.logger.log('Getting metrics summary', 'MetricsService.getMetricsSummary');
    return Promise.all([this.getNotificationMetricsSummary(), this.getSystemMetricsSummary()]);
  }

  /**
   * Observe notification duration
   * @param durationInSeconds - Duration in seconds
   */
  observeNotificationDuration(durationInSeconds: number): void {
    this.logger.log('Observing notification duration', 'MetricsService.observeNotificationDuration');
    this.notificationMetricsProvider.observeNotificationDuration(durationInSeconds);
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.logger.log('Resetting metrics', 'MetricsService.resetMetrics');
    this.notificationMetricsProvider.resetMetrics();
    this.systemMetricsProvider.resetMetrics();
  }
}
