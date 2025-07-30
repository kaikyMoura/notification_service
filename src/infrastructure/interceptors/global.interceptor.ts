import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { AuditInterceptor } from './audit.interceptor';
import { CacheInterceptor } from './cache.interceptor';
import { HttpExceptionInterceptor } from './http-exception.interceptor';
import { LoggerInterceptor } from './logger.interceptor';
import { MemoryMonitorInterceptor } from './memory-monitor.interceptor';
import { MetricsInterceptor } from './metrics.interceptor';
import { PrismaExceptionInterceptor } from './prisma-exception.interceptor';
import { ResponseInterceptor } from './response.interceptor';

/**
 * Global interceptor.
 * @description This interceptor is used to apply all the interceptors in the order they are defined.
 * @implements NestInterceptor
 */
@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
    private readonly memoryInterceptor: MemoryMonitorInterceptor,
    private readonly cacheInterceptor: CacheInterceptor,
    private readonly auditInterceptor: AuditInterceptor,
    private readonly responseInterceptor: ResponseInterceptor<unknown>,
    private readonly httpExceptionInterceptor: HttpExceptionInterceptor,
    private readonly prismaExceptionInterceptor: PrismaExceptionInterceptor,
    private readonly metricsInterceptor: MetricsInterceptor,
    private readonly loggerInterceptor: LoggerInterceptor,
  ) {}

  /**
   * Intercepts the request and applies the interceptors in the order they are defined.
   * @param context - The execution context.
   * @param next - The call handler.
   * @returns The observable.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const interceptors = [
      this.memoryInterceptor,
      this.cacheInterceptor,
      this.auditInterceptor,
      this.responseInterceptor,
      this.httpExceptionInterceptor,
      this.prismaExceptionInterceptor,
      this.metricsInterceptor,
      this.loggerInterceptor,
    ];

    this.logger.info(`🔄 Applying ${interceptors.length} interceptors in the order they are defined.`);

    /**
     * Applies the interceptors in the order they are defined.
     * @param current - The current interceptor.
     * @param currentNext - The call handler.
     * @returns The observable.
     */
    const applyInterceptors = (current: number, currentNext: CallHandler): Observable<unknown> => {
      if (current >= interceptors.length) return currentNext.handle();

      this.logger.info(`🔄 Applying interceptor ${current + 1} of ${interceptors.length}`);

      const interceptor = interceptors[current];
      return interceptor.intercept(context, {
        handle: () => applyInterceptors(current + 1, currentNext),
      });
    };

    return applyInterceptors(0, next);
  }
}
