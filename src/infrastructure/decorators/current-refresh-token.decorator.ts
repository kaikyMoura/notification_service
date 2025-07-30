import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from '../../domain/interfaces/custom-request.interface';

/**
 * Current refresh token decorator
 * @description This decorator is used to get the current refresh token from the request
 * @example
 * ```typescript
 * @Get('me')
 * async getMe(@CurrentRefreshToken() refreshToken: string) {
 *   return refreshToken;
 * }
 * ```
 */
export const CurrentRefreshToken = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<CustomRequest>();
  const token = request.cookies?.refreshToken;

  if (!token || typeof token !== 'string') {
    throw new Error('Refresh token is missing or invalid');
  }

  return token;
});
