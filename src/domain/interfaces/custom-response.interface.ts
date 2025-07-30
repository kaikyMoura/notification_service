/**
 * The custom response interface
 * @description This interface is used to extend the response interface
 */
export interface CustomResponse {
  /**
   * Headers sent
   */
  headersSent: boolean;

  /**
   * Set header
   */
  setHeader: (key: string, value: string) => void;

  /**
   * Status
   */
  status: (statusCode: number) => CustomResponse;

  /**
   * Json
   */
  json: (data: unknown) => void;

  /**
   * Status code
   */
  statusCode: number;

  /**
   * Get
   */
  get: (key: string) => string;

  /**
   * On
   */
  on: (event: string, listener: () => void) => void;

  /**
   * Get header
   */
  getHeader: (key: string) => string;

  /**
   * Get headers
   */
  getHeaderNames: () => string[];
}
