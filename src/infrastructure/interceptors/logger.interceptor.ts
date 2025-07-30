import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { CustomRequest } from '../../domain/interfaces/custom-request.interface';
import { CustomResponse } from '../../domain/interfaces/custom-response.interface';

/**
 * Interceptor to log requests and responses.
 * @description This interceptor is used to log requests and responses.
 * @implements NestInterceptor
 */
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {}

  /**
   * Intercepts the request and logs the request and response.
   * @param context - The context of the request.
   * @param next - The next handler.
   * @returns The result of the request.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const response = context.switchToHttp().getResponse<CustomResponse>();

    const { method, url, body, query, params } = request;

    const { statusCode } = response;
    this.logger.info(`${method} ${url} ${statusCode}`, 'LoggerInterceptor');

    if (process.env.NODE_ENV === 'development') {
      if (body) this.logger.debug?.(`Request Body: ${JSON.stringify(body)}`);
      if (query) this.logger.debug?.(`Request Query: ${JSON.stringify(query)}`);
      if (params) this.logger.debug?.(`Request Params: ${JSON.stringify(params)}`);
    }

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.info(`Outgoing Response: ${method} ${url} - ${responseTime}ms`);
      }),
    );
  }
}
