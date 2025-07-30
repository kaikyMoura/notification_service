import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Registry } from 'prom-client';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { getSystemMetricsDefinition, SystemMetrics } from '../configs/system-metrics.definition';
import { RequestMetrics } from '../interfaces/request.metrics.interface';
import { ISystemMetrics } from '../interfaces/system.metrics.interface';

@Injectable()
export class SystemMetricsProvider implements OnModuleInit, ISystemMetrics {
  private readonly registry: Registry;
  private readonly metrics: SystemMetrics;

  constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
    this.registry = new Registry();
    this.metrics = getSystemMetricsDefinition(this.registry);
  }

  /**
   * Get the average response time
   * @param minutes - The number of minutes to get the average response time
   * @returns The average response time
   */
  getAverageResponseTime(): number {
    return Number(this.metrics.averageResponseTime.get());
  }

  /**
   * Get the request count
   * @param minutes - The number of minutes to get the request count
   * @returns The request count
   */
  getRequestCount(): number {
    return Number(this.metrics.requestCount.get());
  }

  /**
   * Get the error rate
   * @param minutes - The number of minutes to get the error rate
   * @returns The error rate
   */
  getErrorRate(): number {
    return Number(this.metrics.errorRate.get());
  }

  /**
   * Get the metrics
   * @returns The metrics
   */
  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get the registry
   * @returns The registry
   */
  getRegistry(): Registry {
    return this.registry;
  }

  /**
   * Reset the metrics
   */
  resetMetrics(): void {
    this.registry.resetMetrics();
  }

  /**
   * Get the metrics summary
   * @returns The metrics summary
   */
  async getMetricsSummary(): Promise<Record<string, any>> {
    const meta = {
      memoryUsage: (await this.metrics.memoryUsage.get()).values[0]?.value || 0,
      cpuUsage: (await this.metrics.cpuUsage.get()).values[0]?.value || 0,
    };

    this.logMetric('getSummary', 'Getting system metrics summary', meta);
    return meta;
  }

  /**
   * On module init
   * @description Initialize the system metrics service
   */
  onModuleInit(): void {
    this.logger.info('SystemMetricsService initialized');
  }

  /**
   * Record an HTTP request metric
   * @param metric - The request metric to be recorded
   */
  recordHttpRequest(metric: RequestMetrics): void {
    this.metrics.memoryUsage.set(metric.responseTime / 1000);
    this.metrics.cpuUsage.set(metric.responseTime / 1000);
  }

  /**
   * Log a metric
   * @param method - The method name
   * @param message - The message to log
   * @param data - The data to log
   */
  private logMetric(method: string, message: string, data?: Record<string, any>) {
    this.logger.info(message, `SystemMetricsService.${method}`, data);
  }
}
