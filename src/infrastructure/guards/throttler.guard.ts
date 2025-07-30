import { ExecutionContext, Inject, Injectable, LoggerService, Optional } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import { CustomRequest } from 'src/domain/interfaces/custom-request.interface';
import { throttlerConfig } from 'src/shared/configs/throttler.config';

/**
 * Throttler guard
 * @description This is the guard for the throttler module
 * @returns Throttler guard
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject(throttlerConfig.KEY)
    private readonly config: ConfigType<typeof throttlerConfig>,

    @Inject(ThrottlerStorage)
    storageService: ThrottlerStorage,

    reflector: Reflector,

    @Optional()
    private readonly logger?: LoggerService,
  ) {
    super(
      {
        throttlers: [
          {
            ttl: config.THROTTLER_TTL,
            limit: config.THROTTLER_LIMIT,
          },
        ],
      },
      storageService,
      reflector,
    );
  }

  /**
   * Check if the request can continue based on the rate limit.
   * @param context - The execution context
   * @returns True if the request can continue, false otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAllowed = await super.canActivate(context);

    if (!isAllowed) {
      const contextType = context.getType();

      if (contextType === 'http') {
        const request = context.switchToHttp().getRequest<CustomRequest>();
        const { ip, method, route, url } = request;

        this.logger?.warn?.(
          `[CustomThrottlerGuard] Rate limit exceeded for IP ${ip} on ${method} ${url ?? route?.path}`,
        );
      } else {
        this.logger?.warn?.(`[CustomThrottlerGuard] Rate limit exceeded on context type: ${contextType}`);
      }
    }

    return isAllowed;
  }
}
