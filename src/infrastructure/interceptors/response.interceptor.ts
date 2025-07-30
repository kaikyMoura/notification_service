import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomRequest } from '../../domain/interfaces/custom-request.interface';
import { ILoggerService } from '../logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from '../logger/logger.constants';

/**
 * Interface to standardize the response format.
 */
export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path?: string;
  method?: string;
}

/**
 * Interceptor to format the response.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {}
  /**
   * Intercepts the response and formats it into a standard structure.
   * @param context - The execution context of the request.
   * @param next - The call handler to process the request.
   * @returns An observable that emits the formatted response.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const { url, method } = request;

    this.logger.log(`🔄 ResponseInterceptor initialized for ${method} ${url}`, 'ResponseInterceptor');

    return next.handle().pipe(
      map((data: T) => {
        this.logger.log(`🔄 ResponseInterceptor formatted for ${method} ${url}`, 'ResponseInterceptor');

        this.logger.log(`🔄 ResponseInterceptor data: ${JSON.stringify(data)}`, 'ResponseInterceptor');

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          path: url,
          method,
        };
      }),
    );
  }
}
