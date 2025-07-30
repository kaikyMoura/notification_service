import { Inject, Injectable } from '@nestjs/common';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';

@Injectable()
export class MemoryMonitor {
  private readonly warningThreshold = 80; // 80%
  private readonly criticalThreshold = 90; // 90%

  constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {}

  /**
   * Logs memory usage with appropriate warning levels
   * @description This method is used to log the memory usage of the application.
   * @example
   * ```typescript
   * const memoryMonitor = new MemoryMonitor();
   * memoryMonitor.logMemoryUsage();
   * ```
   */
  logMemoryUsage(): void {
    const memUsage = process.memoryUsage();
    const used = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    const total = Math.round(memUsage.heapTotal / 1024 / 1024); // MB
    const percentage = Math.round((used / total) * 100);

    const message = `Memory Usage: ${used}MB / ${total}MB (${percentage}%)`;

    if (percentage >= this.criticalThreshold) {
      this.logger.error(`🚨 CRITICAL: ${message}`, 'MemoryMonitor.logMemoryUsage');
    } else if (percentage >= this.warningThreshold) {
      this.logger.warn(`⚠️ WARNING: ${message}`, 'MemoryMonitor.logMemoryUsage');
    } else {
      this.logger.log(`ℹ️ INFO: ${message}`, 'MemoryMonitor.logMemoryUsage');
    }
  }

  /**
   * Logs memory usage with custom context
   * @description This method is used to log the memory usage of the application with a custom context.
   * @example
   * ```typescript
   * const memoryMonitor = new MemoryMonitor();
   * memoryMonitor.logMemoryUsageWithContext('CUSTOM_CONTEXT');
   * ```
   */
  logMemoryUsageWithContext(context: string, options?: { detailed?: boolean }): void {
    const memUsage = process.memoryUsage();
    const used = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    const total = Math.round(memUsage.heapTotal / 1024 / 1024); // MB
    const percentage = Math.round((used / total) * 100);

    const message = `[${context}] Memory: ${used}MB/${total}MB (${percentage}%)`;

    if (options?.detailed) {
      this.logDetailedMemoryInfo();
    }

    if (percentage >= this.criticalThreshold) {
      this.logger.error(`🚨 CRITICAL: ${message}`, 'MemoryMonitor.logMemoryUsageWithContext');
      // Force garbage collection on critical memory usage
      this.forceGarbageCollection();
    } else if (percentage >= this.warningThreshold) {
      this.logger.warn(`⚠️ WARNING: ${message}`, 'MemoryMonitor.logMemoryUsageWithContext');
      // Force garbage collection on high memory usage
      this.forceGarbageCollection();
    } else {
      this.logger.log(`ℹ️ INFO: ${message}`, 'MemoryMonitor.logMemoryUsageWithContext');
    }
  }

  /**
   * Gets current memory usage statistics
   * @description This method is used to get the current memory usage statistics of the application.
   * @example
   * ```typescript
   * const memoryMonitor = new MemoryMonitor();
   * const memoryStats = memoryMonitor.getMemoryStats();
   * console.log(memoryStats);
   * ```
   */
  getMemoryStats() {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    };
  }

  /**
   * Forces garbage collection if available
   * @description This method is used to force garbage collection of the application.
   * @example
   * ```typescript
   * const memoryMonitor = new MemoryMonitor();
   * memoryMonitor.forceGarbageCollection();
   * ```
   */
  forceGarbageCollection(): void {
    if (global.gc) {
      const beforeStats = this.getMemoryStats();
      global.gc();
      const afterStats = this.getMemoryStats();
      const freed = beforeStats.heapUsed - afterStats.heapUsed;

      this.logger.log(`🧹 Garbage collection forced - Freed: ${freed}MB`, 'MemoryMonitor.forceGarbageCollection');
      this.logger.log(
        `Before: ${beforeStats.heapUsed}MB, After: ${afterStats.heapUsed}MB`,
        'MemoryMonitor.forceGarbageCollection',
      );
    } else {
      this.logger.warn(
        '⚠️ Garbage collection not available. Start with --expose-gc flag',
        'MemoryMonitor.forceGarbageCollection',
      );
    }
  }

  /**
   * Logs detailed memory information
   * @description This method is used to log the detailed memory information of the application.
   * @example
   * ```typescript
   * const memoryMonitor = new MemoryMonitor();
   * memoryMonitor.logDetailedMemoryInfo();
   * ```
   */
  logDetailedMemoryInfo(): void {
    const stats = this.getMemoryStats();
    const message = {
      heapUsed: `${stats.heapUsed}MB`,
      heapTotal: `${stats.heapTotal}MB`,
      external: `${stats.external}MB`,
      rss: `${stats.rss}MB`,
      percentage: `${stats.percentage}%`,
    };

    this.logger.log(`📊 Detailed Memory Info: ${JSON.stringify(message)}`, 'MemoryMonitor.logDetailedMemoryInfo');
  }
}
