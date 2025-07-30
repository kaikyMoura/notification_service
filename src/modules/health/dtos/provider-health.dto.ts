import { BaseHealthDto, ServiceStatus } from './base-health.dto';

/**
 * @class ProviderHealthDto
 * @description DTO for provider health information
 */
export class ProviderHealthDto extends BaseHealthDto {
  readonly name: string;
  readonly status: ServiceStatus;
  readonly error?: string;
  readonly responseTime?: number;
  readonly endpoint?: string;

  constructor(name: string, status: ServiceStatus, error?: string, responseTime?: number, endpoint?: string) {
    super();
    this.name = name;
    this.status = status;
    this.error = error;
    this.responseTime = responseTime;
    this.endpoint = endpoint;
  }

  /**
   * Check if provider is healthy
   * @returns boolean
   */
  isHealthy(): boolean {
    return this.status === ServiceStatus.UP;
  }

  /**
   * Get response time in seconds
   * @returns number | undefined
   */
  getResponseTimeInSeconds(): number | undefined {
    return this.responseTime ? this.responseTime / 1000 : undefined;
  }

  /**
   * Create healthy provider
   * @param name - Provider name
   * @param responseTime - Response time
   * @param endpoint - Provider endpoint
   * @returns ProviderHealthDto
   */
  static healthy(name: string, responseTime?: number, endpoint?: string): ProviderHealthDto {
    return new ProviderHealthDto(name, ServiceStatus.UP, undefined, responseTime, endpoint);
  }

  /**
   * Create unhealthy provider
   * @param name - Provider name
   * @param error - Error message
   * @param responseTime - Response time
   * @param endpoint - Provider endpoint
   * @returns ProviderHealthDto
   */
  static unhealthy(name: string, error: string, responseTime?: number, endpoint?: string): ProviderHealthDto {
    return new ProviderHealthDto(name, ServiceStatus.DOWN, error, responseTime, endpoint);
  }
}
