/**
 * Response type
 * @template T - The type of the data
 * @example
 * ```typescript
 * const response: ResponseType<User> = { success: true, data: user };
 * ```
 */
export type ResponseType<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};
