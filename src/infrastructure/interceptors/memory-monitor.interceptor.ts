import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { CustomRequest } from '../../domain/interfaces/custom-request.interface';
import { MemoryMonitor } from '../../shared/utils/memory-monitor';

/**
 * Interceptor to log memory usage.
 * @description This interceptor is used to log memory usage.
 * @implements NestInterceptor
 */
@Injectable()
export class MemoryMonitorInterceptor implements NestInterceptor {
  constructor(
    private readonly memoryMonitor: MemoryMonitor,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {}

  /**
   * Intercepts the request and logs the memory usage.
   * @param context - The context of the request.
   * @param next - The next handler.
   * @returns The result of the request.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const { method, url } = request;

    this.logger.info(
      `🔄 MemoryMonitorInterceptor initialized for ${method} ${url}`,
      'MemoryMonitorInterceptor.intercept',
    );

    this.memoryMonitor.logMemoryUsageWithContext(`🔄 MemoryMonitorInterceptor before ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        this.memoryMonitor.logMemoryUsageWithContext(
          `🔄 MemoryMonitorInterceptor after ${method} ${url} (${duration}ms)`,
        );

        if (duration > 5000) {
          this.memoryMonitor.forceGarbageCollection();
        }

        if (url?.includes('health')) {
          this.memoryMonitor.logDetailedMemoryInfo();
        }
      }),
    );
  }
}
