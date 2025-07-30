import { BaseHealthDto, HealthStatus } from './base-health.dto';

/**
 * @class HealthSummaryDto
 * @description DTO for health summary
 */
export class HealthSummaryDto extends BaseHealthDto {
  readonly overall: number;
  readonly up: number;
  readonly down: number;
  readonly total: number;
  readonly lastCheck: Date;
  readonly status: HealthStatus;

  constructor(up: number, total: number, lastCheck: Date = new Date()) {
    super();
    this.up = up;
    this.down = total - up;
    this.total = total;
    this.overall = total > 0 ? (up / total) * 100 : 100;
    this.lastCheck = lastCheck;
    this.status = this.overall >= 80 ? HealthStatus.OK : HealthStatus.ERROR;
  }

  /**
   * Check if overall health is good
   * @param threshold - Health threshold (default: 80%)
   * @returns boolean
   */
  isHealthy(threshold: number = 80): boolean {
    return this.overall >= threshold;
  }

  /**
   * Get health percentage
   * @returns number
   */
  getHealthPercentage(): number {
    return this.overall;
  }

  /**
   * Get health status description
   * @returns string
   */
  getHealthStatusDescription(): string {
    if (this.overall >= 90) return 'Excellent';
    if (this.overall >= 80) return 'Good';
    if (this.overall >= 60) return 'Fair';
    return 'Poor';
  }

  /**
   * Create from service health array
   * @param services - Array of service health objects
   * @returns HealthSummaryDto
   */
  static fromServices(services: Array<{ status: 'up' | 'down' }>): HealthSummaryDto {
    const up = services.filter(s => s.status === 'up').length;
    const total = services.length;
    
    return new HealthSummaryDto(up, total);
  }

  /**
   * Create empty summary
   * @returns HealthSummaryDto
   */
  static empty(): HealthSummaryDto {
    return new HealthSummaryDto(0, 0);
  }
} 