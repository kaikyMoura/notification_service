import { IMetricsRegistryProvider, IMetricsSummaryProvider } from './metrics.provider.interface';
import { RequestMetrics } from './request.metrics.interface';

export interface ISystemMetrics extends IMetricsRegistryProvider, IMetricsSummaryProvider {
  /**
   * Record an HTTP request metric
   * @param metric - The request metric to be recorded
   */
  recordHttpRequest(metric: RequestMetrics): void;

  /**
   * Get the average response time
   * @returns The average response time
   */
  getAverageResponseTime(): number;

  /**
   * Get the request count
   * @returns The request count
   */
  getRequestCount(): number;

  /**
   * Get the error rate
   * @returns The error rate
   */
  getErrorRate(): number;
}
