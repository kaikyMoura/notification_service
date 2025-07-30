import { SetMetadata } from '@nestjs/common';

/**
 * IS_PUBLIC_KEY
 * @description This is the key for the public decorator
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public decorator
 * @description This decorator is used to mark a route as public
 * @example
 * ```typescript
 * @Public()
 * @Get('public')
 * async getPublic() {
 *   return 'This is a public route';
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
