import { IMetricsRegistryProvider, IMetricsSummaryProvider } from './metrics.provider.interface';

/**
 * @interface INotificationMetrics
 * @description Interface for notification-specific metrics service
 */
export interface INotificationMetrics extends IMetricsRegistryProvider, IMetricsSummaryProvider {
  /**
   * Increment the total number of successful notifications sent
   */
  incrementSentCount(): void;

  /**
   * Increment the total number of failed notifications sent
   */
  incrementFailedCount(): void;

  /**
   * Register the duration of a notification send operation
   * @param durationInSeconds duration of the operation in seconds
   */
  observeNotificationDuration(durationInSeconds: number): void;
}
