import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from 'src/domain/interfaces/custom-request.interface';
/**
 * Current user decorator
 * @description This decorator is used to get the current user from the request
 * @example
 * ```typescript
 * @Get('me')
 * async getMe(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<CustomRequest>();
  return request.user;
});
