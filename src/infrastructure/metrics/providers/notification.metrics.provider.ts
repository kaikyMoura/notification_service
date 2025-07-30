import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Registry } from 'prom-client';
import { ILoggerService } from '../../logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from '../../logger/logger.constants';
import { getNotificationMetricsDefinition, NotificationMetrics } from '../configs/notification-metrics.definition';
import { INotificationMetrics } from '../interfaces/notification.metrics.interface';

/**
 * @class NotificationMetricsService
 * @description Service for collecting and exposing notification-specific metrics
 */
@Injectable()
export class NotificationMetricsProvider implements INotificationMetrics, OnModuleInit {
  private readonly registry: Registry;
  private readonly metrics: NotificationMetrics;

  constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
    this.registry = new Registry();
    this.metrics = getNotificationMetricsDefinition(this.registry);
  }

  /**
   * On module init
   * @description Initialize the notification metrics service
   */
  onModuleInit(): void {
    this.logMetric('onModuleInit', 'NotificationMetricsService initialized');
  }

  /**
   * Get the metrics
   * @description Get the metrics
   * @returns Promise<string>
   */
  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get the registry
   * @description Get the registry
   * @returns Registry
   */
  getRegistry(): Registry {
    return this.registry;
  }

  /**
   * Reset the metrics
   * @description Reset the metrics
   */
  resetMetrics(): void {
    this.registry.clear();
  }

  /**
   * Get the summary of the notification metrics
   * @description Get the summary of the notification metrics
   * @returns Promise<Record<string, any>>
   */
  getMetricsSummary(): Promise<Record<string, any>> {
    return this.registry.getMetricsAsJSON();
  }

  /**
   * Increment the total number of successful notifications sent
   * @description Increment the total number of successful notifications sent
   */
  incrementSentCount(): void {
    this.metrics.totalSent.inc();
  }

  /**
   * Increment the total number of failed notifications sent
   * @description Increment the total number of failed notifications sent
   */
  incrementFailedCount(): void {
    this.metrics.totalFailed.inc();
  }

  /**
   * Observe the duration of a notification send operation
   * @param durationInSeconds - Duration of the operation in seconds
   * @description Observe the duration of a notification send operation
   */
  observeNotificationDuration(durationInSeconds: number): void {
    this.metrics.deliveryTime.observe(durationInSeconds);
  }

  /**
   * Get the summary of the notification metrics
   * @description Get the summary of the notification metrics
   * @returns Promise<Record<string, number>>
   */
  async getSummary(): Promise<Record<string, number>> {
    const meta: Record<string, any> = {
      sent: (await this.metrics.totalSent.get()).values[0]?.value || 0,
      failed: (await this.metrics.totalFailed.get()).values[0]?.value || 0,
    };

    this.logMetric('getSummary', 'Getting notification metrics summary', meta);
    return meta;
  }

  /**
   * Log a metric
   * @description Log a metric
   * @param method - Method name
   * @param message - Message to log
   * @param data - Data to log
   */
  private logMetric(method: string, message: string, data?: Record<string, any>) {
    this.logger.info(message, `NotificationMetricsService.${method}`, data);
  }
}
