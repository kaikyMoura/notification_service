import { BaseHealthDto, ServiceStatus } from './base-health.dto';

/**
 * @class ServiceHealthDto
 * @description DTO for service health information
 */
export class ServiceHealthDto extends BaseHealthDto {
  readonly status: ServiceStatus;
  readonly responseTime?: number;
  readonly error?: string;
  readonly lastCheck: Date;

  constructor(
    status: ServiceStatus,
    lastCheck: Date,
    responseTime?: number,
    error?: string,
  ) {
    super();
    this.status = status;
    this.lastCheck = lastCheck;
    this.responseTime = responseTime;
    this.error = error;
  }

  /**
   * Check if service is healthy
   * @returns boolean
   */
  isHealthy(): boolean {
    return this.status === ServiceStatus.UP;
  }

  /**
   * Get response time in seconds
   * @returns number
   */
  getResponseTimeInSeconds(): number | undefined {
    return this.responseTime ? this.responseTime / 1000 : undefined;
  }
} 