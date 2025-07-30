import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator
 * @description This is the decorator for the roles module
 * @returns Roles decorator
 */
export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
