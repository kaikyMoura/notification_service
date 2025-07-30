import { Registry } from 'prom-client';

/**
 * @interface IMetricsRegistryProvider
 * @description Interface for metrics registry provider
 */
export interface IMetricsRegistryProvider {
  /**
   * Returns the Prometheus metrics as a string (to expose in /metrics endpoint)
   */
  getMetrics(): Promise<string>;

  /**
   * Provides access to the raw Prometheus registry.
   */
  getRegistry(): Registry;

  /**
   * Clears all metric values (useful in tests or on restart).
   */
  resetMetrics(): void;
}

/**
 * @interface IMetricsSummaryProvider
 * @description Interface for metrics summary provider
 */
export interface IMetricsSummaryProvider {
  /**
   * Returns a summary (structured) of key metric values.
   */
  getMetricsSummary(): Promise<Record<string, any>>;
}
