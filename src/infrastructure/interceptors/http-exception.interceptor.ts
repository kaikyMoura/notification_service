import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, Observable, throwError } from 'rxjs';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';

/**
 * Interceptor to handle HTTP exceptions.
 */
@Injectable()
export class HttpExceptionInterceptor implements NestInterceptor {
  constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {}

  /**
   * Intercepts the request and handles the error
   * @param context - The execution context
   * @param next - The call handler
   * @returns The observable
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextName = context.getClass().name;

    this.logger.log('🔄 HttpExceptionInterceptor initialized', 'HttpExceptionInterceptor');

    return next.handle().pipe(
      catchError((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (error instanceof HttpException) {
          this.logger.error(`[${contextName}] HttpException: ${errorMessage}`, 'HttpExceptionInterceptor');
          return throwError(() => new HttpException(errorMessage, error.getStatus()));
        }

        if (error instanceof AxiosError) {
          const status = error.response?.status ?? 500;
          const responseData = (error.response?.data as object) ?? 'Unknown Axios error';
          this.logger.error(`[${contextName}] AxiosError: ${errorMessage}`, error.stack);
          return throwError(() => new HttpException(responseData, status));
        }

        this.logger.error(`[${contextName}] Unhandled error: ${errorMessage}`, (error as { stack: string }).stack);
        return throwError(() => new InternalServerErrorException(errorMessage));
      }),
    );
  }
}
