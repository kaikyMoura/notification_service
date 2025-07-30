import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { AuditAction, AuditLog } from 'prisma/app/generated/prisma/client';
import { from, mergeMap, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CustomRequest } from 'src/domain/interfaces/custom-request.interface';
import { AuditService } from 'src/infrastructure/audit/audit.service';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';

/**
 * Interface to parse the request body.
 */
type ParsedBody = {
  id?: string;
  recordId?: string;
  [key: string]: any;
};

/**
 * Interceptor to log audit actions.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    @Inject(LOGGER_SERVICE)
    private logger: ILoggerService,
  ) {}

  /**
   * Intercepts the request and logs the audit.
   * @param context - The context of the request.
   * @param next - The next handler.
   * @returns The result of the request.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextName = context.getClass().name;
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const { method, body, user } = request;
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip;

    const auditActionsMap: Record<string, AuditAction> = {
      POST: AuditAction.INSERT,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    const action = auditActionsMap[method ?? ''];

    if (!action) {
      this.logger.info(`Skipping audit for ${method} request`, 'AuditInterceptor');
      return next.handle();
    }

    let parsedBody: ParsedBody = {};

    if (typeof body === 'string') {
      try {
        parsedBody = JSON.parse(body) as ParsedBody;
      } catch {
        this.logger.warn('⚠️ Failed to parse request body as JSON', 'AuditInterceptor');
        parsedBody = {};
      }
    } else if (typeof body === 'object' && body !== null) {
      parsedBody = body;
    }

    const auditPayload: AuditLog = {
      id: '',
      createdAt: new Date(),
      tableName: contextName,
      recordId: parsedBody?.recordId ?? parsedBody?.id ?? '',
      oldValues: action === AuditAction.UPDATE ? parsedBody : null,
      newValues: parsedBody,
      userId: user?.sub ?? '',
      ipAddress: ipAddress ?? '',
      userAgent: userAgent ?? '',
      action,
    };

    const startTime = Date.now();

    return next.handle().pipe(
      mergeMap(result =>
        from(this.auditService.logAudit(auditPayload)).pipe(
          tap(() => {
            const responseTime = Date.now() - startTime;
            this.logger.info(`✅ Audit logged (${action}) in ${responseTime}ms`, 'AuditInterceptor');
          }),
          catchError(error => {
            this.logger.error(`❌ Audit logging failed: ${error}`, 'AuditInterceptor');
            return of(result);
          }),
          map(result => result as unknown),
        ),
      ),
    );
  }
}
