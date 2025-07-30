import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { MemoryMonitor } from 'src/shared/utils/memory-monitor';
import {
  HealthCheckResponseDto,
  HealthCheckDetailsDto,
  HealthCheckItemDto,
  MemoryHealthDto,
  HealthStatus,
} from '../dtos';

/**
 * Health service for checking the health of the application
 * @class HealthService
 * @description Comprehensive health monitoring service
 */
@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly memoryMonitor: MemoryMonitor,
    @Optional() @Inject(CACHE_MANAGER) private cacheManager?: Cache,
  ) {}

  /**
   * Get comprehensive health check
   * @returns Promise<HealthCheckResponseDto>
   */
  async getHealthCheck(): Promise<HealthCheckResponseDto> {
    try {
      this.memoryMonitor.logMemoryUsageWithContext('HEALTH_CHECK_START', {
        detailed: true,
      });

      const startTime = Date.now();
      const checks = await Promise.allSettled([this.checkDatabase(), this.checkRedis(), this.checkMemory()]);

      const responseTime = Date.now() - startTime;
      const checkNames = ['database', 'redis', 'memory'];

      const healthChecks = checks.map((result, index) => {
        const name = checkNames[index];

        if (result.status === 'fulfilled') {
          return new HealthCheckItemDto(name, result.value.status, result.value, result.value.responseTime);
        }

        return new HealthCheckItemDto(name, HealthStatus.ERROR, { error: result.reason as string }, responseTime);
      });

      const details = new HealthCheckDetailsDto(responseTime, healthChecks);

      // Force garbage collection if memory usage is critical
      const memoryCheck = healthChecks.find(check => check.name === 'memory');
      if (memoryCheck && memoryCheck.details.percentage > 80) {
        this.memoryMonitor.forceGarbageCollection();
      }

      this.memoryMonitor.logMemoryUsageWithContext('HEALTH_CHECK_END');

      return HealthCheckResponseDto.healthy(
        details,
        process.uptime(),
        this.configService.get<string>('NODE_ENV', 'development'),
        process.env.npm_package_version || '1.0.0',
      );
    } catch {
      this.memoryMonitor.logMemoryUsageWithContext('HEALTH_CHECK_ERROR', {
        detailed: true,
      });

      const errorChecks = [
        new HealthCheckItemDto('database', HealthStatus.ERROR, { error: 'Health check failed' }),
        new HealthCheckItemDto('redis', HealthStatus.ERROR, { error: 'Health check failed' }),
        new HealthCheckItemDto('memory', HealthStatus.ERROR, { error: 'Health check failed' }),
      ];

      const details = new HealthCheckDetailsDto(0, errorChecks);

      return HealthCheckResponseDto.error(details, process.uptime(), 'unknown', '1.0.0');
    }
  }

  /**
   * Get simple health check
   * @returns Promise<{ status: string; timestamp: string }>
   */
  async getSimpleHealthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      if (this.cacheManager) {
        await this.cacheManager.set('health-simple', 'ok', 5);
        const result = await this.cacheManager.get('health-simple');
        if (result !== 'ok') {
          throw new Error('Redis check failed');
        }
      }

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get readiness check
   * @returns Promise<{ status: string; timestamp: string }>
   */
  async getReadinessCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      if (this.cacheManager) {
        await this.cacheManager.set('ready-check', 'ok', 5);
      }

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'not-ready',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get liveness check
   * @returns { status: string; timestamp: string }
   */
  getLivenessCheck(): { status: string; timestamp: string } {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check database connection
   * @returns Promise<{ status: HealthStatus; responseTime: number; error?: string }>
   */
  private async checkDatabase(): Promise<{ status: HealthStatus; responseTime: number; error?: string }> {
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: HealthStatus.OK,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: HealthStatus.ERROR,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  /**
   * Check Redis connection
   * @returns Promise<{ status: HealthStatus; responseTime: number; error?: string }>
   */
  private async checkRedis(): Promise<{ status: HealthStatus; responseTime: number; error?: string }> {
    const startTime = Date.now();
    try {
      if (!this.cacheManager) {
        throw new Error('Cache manager not available');
      }
      await this.cacheManager.set('health-check', 'ok', 10);
      const result = await this.cacheManager.get('health-check');
      if (result !== 'ok') {
        throw new Error('Redis read/write test failed');
      }
      return {
        status: HealthStatus.OK,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: HealthStatus.ERROR,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown Redis error',
      };
    }
  }

  /**
   * Check memory usage
   * @returns MemoryHealthDto
   */
  private checkMemory(): MemoryHealthDto {
    const memStats = this.memoryMonitor.getMemoryStats();
    return MemoryHealthDto.fromMemoryStats(memStats.heapUsed, memStats.heapTotal);
  }
}
