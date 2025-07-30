import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IClientInfo } from 'src/domain/interfaces/client-info.interface';
import { CustomRequest } from 'src/domain/interfaces/custom-request.interface';

/**
 * @decorator ClientInfo
 * @description Decorator to get client info from request
 * @param data - The data to pass to the decorator
 * @param ctx - The execution context
 * @returns The client info
 */
export const ClientInfo = createParamDecorator((_data: unknown, ctx: ExecutionContext): IClientInfo => {
  const request = ctx.switchToHttp().getRequest<CustomRequest>();
  return request.clientInfo || {};
});
