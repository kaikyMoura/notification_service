import { BaseHealthDto, HealthStatus } from './base-health.dto';

/**
 * @class MemoryHealthDto
 * @description DTO for memory health information
 */
export class MemoryHealthDto extends BaseHealthDto {
  readonly status: HealthStatus;
  readonly used: number;
  readonly total: number;
  readonly percentage: number;
  readonly responseTime?: number;
  readonly error?: string;

  constructor(
    used: number,
    total: number,
    percentage: number,
    status: HealthStatus = HealthStatus.OK,
    responseTime?: number,
    error?: string,
  ) {
    super();
    this.used = used;
    this.total = total;
    this.percentage = percentage;
    this.status = status;
    this.responseTime = responseTime;
    this.error = error;
  }

  /**
   * Check if memory usage is critical
   * @param threshold - Memory usage threshold (default: 85%)
   * @returns boolean
   */
  isCritical(threshold: number = 85): boolean {
    return this.percentage > threshold;
  }

  /**
   * Get available memory in bytes
   * @returns number
   */
  getAvailableMemory(): number {
    return this.total - this.used;
  }

  /**
   * Get memory usage in MB
   * @returns { used: number; total: number; available: number }
   */
  getMemoryInMB() {
    const mb = 1024 * 1024;
    return {
      used: Math.round(this.used / mb),
      total: Math.round(this.total / mb),
      available: Math.round(this.getAvailableMemory() / mb),
    };
  }

  /**
   * Create from memory stats
   * @param heapUsed - Used heap memory
   * @param heapTotal - Total heap memory
   * @param responseTime - Response time
   * @returns MemoryHealthDto
   */
  static fromMemoryStats(
    heapUsed: number,
    heapTotal: number,
    responseTime?: number,
  ): MemoryHealthDto {
    const percentage = (heapUsed / heapTotal) * 100;
    const status = percentage > 85 ? HealthStatus.ERROR : HealthStatus.OK;

    return new MemoryHealthDto(heapUsed, heapTotal, percentage, status, responseTime);
  }
} 