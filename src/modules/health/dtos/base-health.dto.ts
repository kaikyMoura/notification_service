/**
 * @class BaseHealthDto
 * @description Base DTO for health-related responses
 */
export abstract class BaseHealthDto {
  readonly timestamp: Date;

  constructor() {
    this.timestamp = new Date();
  }
}

/**
 * @enum HealthStatus
 * @description Health status enumeration
 */
export enum HealthStatus {
  OK = 'ok',
  ERROR = 'error',
  DOWN = 'down',
  SHUTTING_DOWN = 'shutting_down',
}

/**
 * @enum ServiceStatus
 * @description Service status enumeration
 */
export enum ServiceStatus {
  UP = 'up',
  DOWN = 'down',
}

/**
 * @interface HealthCheckResult
 * @description Base interface for health check results
 */
export interface HealthCheckResult {
  status: HealthStatus;
  responseTime?: number;
  error?: string;
}
