import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { CustomRequest } from '../../domain/interfaces/custom-request.interface';
import { CustomResponse } from '../../domain/interfaces/custom-response.interface';
import { ILoggerService } from '../logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from '../logger/logger.constants';
import { NotificationMetricsProvider } from '../metrics/providers/notification.metrics.provider';
import { SystemMetricsProvider } from '../metrics/providers/system.metrics.provider';
import { RequestMetrics } from '../metrics/interfaces/request.metrics.interface';

/**
 * Interceptor to record metrics for HTTP requests.
 * @description This interceptor is used to record metrics for HTTP requests.
 * @implements NestInterceptor
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
    private readonly notificationMetrics: NotificationMetricsProvider,
    private readonly systemMetrics: SystemMetricsProvider,
  ) {}

  /**
   * Intercept the request and record metrics.
   * @param context - The execution context.
   * @param next - The next handler.
   * @returns The observable.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const response = context.switchToHttp().getResponse<CustomResponse>();

    const method = request.method ?? 'UNKNOWN';
    const route = request.route?.path ?? request.originalUrl ?? 'UNKNOWN';
    const userAgent = request.headers['user-agent'] ?? 'UNKNOWN';
    const userId = request.user?.sub ?? 'anonymous';

    this.logger.debug(`Intercepting ${method} ${route}`, 'MetricsInterceptor');

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        const statusCode = response.statusCode || 500;

        const metric: RequestMetrics = {
          method,
          route,
          statusCode,
          responseTime: duration,
          timestamp: new Date(),
          userAgent,
          userId,
        };

        this.recordMetrics(metric);

        if (duration > 1000) {
          this.logger.warn(`Slow request: ${method} ${route} took ${duration}ms`, 'MetricsInterceptor');
        }
      }),
      catchError(err => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error in ${method} ${route}: ${errorMessage}`, 'MetricsInterceptor');
        throw err;
      }),
    );
  }

  /**
   * Record metrics for the request.
   * @param metric - The request metric.
   */
  private recordMetrics(metric: RequestMetrics): void {
    this.recordNotificationMetrics(metric);
    this.recordSystemMetrics(metric);

    this.logger.debug(
      `Recorded metrics: ${metric.method} ${metric.route} ${metric.statusCode} - ${metric.responseTime}ms`,
      'MetricsInterceptor.recordMetrics',
    );
  }

  /**
   * Record notification metrics for the request.
   * @param metric - The request metric.
   */
  private recordNotificationMetrics(metric: RequestMetrics): void {
    try {
      this.notificationMetrics.observeNotificationDuration(metric.responseTime / 1000);

      if (metric.statusCode < 400) {
        this.notificationMetrics.incrementSentCount();
      } else {
        this.notificationMetrics.incrementFailedCount();
      }
    } catch (error) {
      this.logger.error(
        `Failed to record notification metrics: ${error}`,
        'MetricsInterceptor.recordNotificationMetrics',
      );
    }
  }

  /**
   * Record system metrics for the request.
   * @param metric - The request metric.
   */
  private recordSystemMetrics(metric: RequestMetrics): void {
    try {
      this.systemMetrics.recordHttpRequest(metric);
    } catch (error) {
      this.logger.error(`Failed to record system metrics: ${error}`, 'MetricsInterceptor.recordSystemMetrics');
    }
  }

  /**
   * Get the metrics for the request.
   * @returns The metrics.
   */
  async getMetrics(): Promise<Record<string, any>> {
    try {
      const [notification, system] = await Promise.all([
        this.notificationMetrics.getMetricsSummary(),
        this.systemMetrics.getMetricsSummary(),
      ]);

      return {
        notification,
        system,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch metrics: ${error}`, 'MetricsInterceptor.getMetrics');
      return {};
    }
  }

  /**
   * Get the average response time for the request.
   * @param minutes - The number of minutes to get the average response time.
   * @returns The average response time.
   */
  getAverageResponseTime(minutes = 5): number {
    this.logger.debug(`Calculating avg. response time (last ${minutes}min)`, 'MetricsInterceptor');
    return this.systemMetrics.getAverageResponseTime();
  }

  /**
   * Get the request count for the request.
   * @param minutes - The number of minutes to get the request count.
   * @returns The request count.
   */
  getRequestCount(minutes = 5): number {
    this.logger.debug(`Calculating request count (last ${minutes}min)`, 'MetricsInterceptor');
    return this.systemMetrics.getRequestCount();
  }

  /**
   * Get the error rate for the request.
   * @param minutes - The number of minutes to get the error rate.
   * @returns The error rate.
   */
  getErrorRate(minutes = 5): number {
    this.logger.debug(`Calculating error rate (last ${minutes}min)`, 'MetricsInterceptor');
    return this.systemMetrics.getErrorRate();
  }
}
