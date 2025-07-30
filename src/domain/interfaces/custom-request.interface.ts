import { IncomingHttpHeaders } from 'http';

/**
 * Custom request interface
 * @description This interface is used to extend the request interface
 */
export interface CustomRequest {
  /**
   * Headers
   * @description The headers of the request
   */
  headers: IncomingHttpHeaders;

  /**
   * User
   * @description The user of the request
   */
  user: { sub: string; name: string; email: string; role?: string };

  /**
   * [key: string]: unknown;
   * @description The unknown properties of the request
   */
  [key: string]: unknown;

  /**
   * Route
   * @description The route of the request
   */
  route?: { path: string; method: string };

  /**
   * Cookies
   * @description The cookies of the request
   */
  cookies?: {
    refreshToken?: string;
    accessToken?: string;
  };

  /**
   * Params
   * @description The params of the request
   */
  params?: Record<string, string>;

  /**
   * Query
   * @description The query of the request
   */
  query?: Record<string, string>;

  /**
   * Body
   * @description The body of the request
   */
  body?: Record<string, unknown>;

  /**
   * Ip
   * @description The ip of the request
   */
  ip?: string;

  /**
   * Original url
   * @description The original url of the request
   */
  originalUrl?: string;

  /**
   * Url
   * @description The url of the request
   */
  url?: string;

  /**
   * Method
   * @description The method of the request
   */
  method?: string;
}
