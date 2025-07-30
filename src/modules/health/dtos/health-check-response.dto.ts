import { BaseHealthDto, HealthStatus } from './base-health.dto';

/**
 * @class HealthCheckItemDto
 * @description DTO for individual health check item
 */
export class HealthCheckItemDto extends BaseHealthDto {
  readonly name: string;
  readonly status: HealthStatus;
  readonly details: Record<string, any>;
  readonly responseTime?: number;

  constructor(name: string, status: HealthStatus, details: Record<string, any>, responseTime?: number) {
    super();
    this.name = name;
    this.status = status;
    this.details = details;
    this.responseTime = responseTime;
  }

  /**
   * Check if item is healthy
   * @returns boolean
   */
  isHealthy(): boolean {
    return this.status === HealthStatus.OK;
  }

  /**
   * Get response time in seconds
   * @returns number | undefined
   */
  getResponseTimeInSeconds(): number | undefined {
    return this.responseTime ? this.responseTime / 1000 : undefined;
  }
}

/**
 * @class HealthCheckDetailsDto
 * @description DTO for health check details
 */
export class HealthCheckDetailsDto extends BaseHealthDto {
  readonly responseTime: number;
  readonly checks: HealthCheckItemDto[];

  constructor(responseTime: number, checks: HealthCheckItemDto[]) {
    super();
    this.responseTime = responseTime;
    this.checks = checks;
  }

  /**
   * Get total response time in seconds
   * @returns number
   */
  getTotalResponseTimeInSeconds(): number {
    return this.responseTime / 1000;
  }

  /**
   * Get number of healthy checks
   * @returns number
   */
  getHealthyChecksCount(): number {
    return this.checks.filter(check => check.isHealthy()).length;
  }

  /**
   * Get number of unhealthy checks
   * @returns number
   */
  getUnhealthyChecksCount(): number {
    return this.checks.filter(check => !check.isHealthy()).length;
  }

  /**
   * Get health percentage
   * @returns number
   */
  getHealthPercentage(): number {
    if (this.checks.length === 0) return 100;
    return (this.getHealthyChecksCount() / this.checks.length) * 100;
  }
}

/**
 * @class HealthCheckResponseDto
 * @description DTO for health check response
 */
export class HealthCheckResponseDto extends BaseHealthDto {
  readonly status: HealthStatus;
  readonly details: HealthCheckDetailsDto;
  readonly uptime?: number;
  readonly environment?: string;
  readonly version?: string;

  constructor(
    status: HealthStatus,
    details: HealthCheckDetailsDto,
    uptime?: number,
    environment?: string,
    version?: string,
  ) {
    super();
    this.status = status;
    this.details = details;
    this.uptime = uptime;
    this.environment = environment;
    this.version = version;
  }

  /**
   * Check if overall health is good
   * @returns boolean
   */
  isHealthy(): boolean {
    return this.status === HealthStatus.OK;
  }

  /**
   * Get uptime in hours
   * @returns number | undefined
   */
  getUptimeInHours(): number | undefined {
    return this.uptime ? this.uptime / 3600 : undefined;
  }

  /**
   * Get uptime in days
   * @returns number | undefined
   */
  getUptimeInDays(): number | undefined {
    return this.uptime ? this.uptime / (3600 * 24) : undefined;
  }

  /**
   * Create healthy response
   * @param details - Health check details
   * @param uptime - System uptime
   * @param environment - Environment name
   * @param version - Application version
   * @returns HealthCheckResponseDto
   */
  static healthy(
    details: HealthCheckDetailsDto,
    uptime?: number,
    environment?: string,
    version?: string,
  ): HealthCheckResponseDto {
    return new HealthCheckResponseDto(HealthStatus.OK, details, uptime, environment, version);
  }

  /**
   * Create error response
   * @param details - Health check details
   * @param uptime - System uptime
   * @param environment - Environment name
   * @param version - Application version
   * @returns HealthCheckResponseDto
   */
  static error(
    details: HealthCheckDetailsDto,
    uptime?: number,
    environment?: string,
    version?: string,
  ): HealthCheckResponseDto {
    return new HealthCheckResponseDto(HealthStatus.ERROR, details, uptime, environment, version);
  }
}
