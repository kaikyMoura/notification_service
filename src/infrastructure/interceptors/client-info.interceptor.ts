import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { ILoggerService } from '../logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from '../logger/logger.constants';

/**
 * The ClientInfoInterceptor class
 * @description This interceptor is used to extract client information from the request
 */
@Injectable()
export class ClientInfoInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {}
  /**
   * Intercept the request
   * @param context - The execution context
   * @param next - The call handler
   * @returns The observable
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract client information
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    // Attach to request for use in controllers/use cases
    request['clientInfo'] = {
      ipAddress,
      userAgent,
    };

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`ClientInfoInterceptor initialized`, 'ClientInfoInterceptor');
      }),
    );
  }

  /**
   * Extract the IP address from the request
   * @param req - The request
   * @returns The IP address
   */
  private extractIpAddress(req: Request): string | undefined {
    // Check for forwarded headers first (for proxy/load balancer scenarios)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      return ips.split(',')[0].trim();
    }

    // Check for real IP header
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fallback to socket remote address (avoid deprecated 'connection')
    return req.socket?.remoteAddress;
  }
}
