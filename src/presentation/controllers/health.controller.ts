import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckResponseDto, HealthCheckResult, ServiceHealthDto } from 'src/modules/health/dtos';
import { HealthService } from 'src/modules/health/services/health.service';
import { NotificationHealthService } from 'src/modules/health/services/notification-health.service';

/**
 * @class HealthController
 * @description Controller for health checks
 */
@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly notificationHealthService: NotificationHealthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get health check' })
  @ApiResponse({ status: 200, description: 'Health check response' })
  async healthCheck(): Promise<HealthCheckResponseDto> {
    return this.healthService.getHealthCheck();
  }

  @Get('simple')
  @ApiOperation({ summary: 'Get simple health check' })
  @ApiResponse({ status: 200, description: 'Simple health check response' })
  async simpleHealthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.healthService.getSimpleHealthCheck();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Get readiness check' })
  @ApiResponse({ status: 200, description: 'Readiness check response' })
  async readinessCheck(): Promise<{ status: string; timestamp: string }> {
    return this.healthService.getReadinessCheck();
  }

  @Get('live')
  @ApiOperation({ summary: 'Get liveness check' })
  @ApiResponse({ status: 200, description: 'Liveness check response' })
  livenessCheck(): { status: string; timestamp: string } {
    return this.healthService.getLivenessCheck();
  }

  @Get('notification')
  @ApiOperation({ summary: 'Get notification health check' })
  @ApiResponse({ status: 200, description: 'Notification health check response' })
  async notificationHealthCheck(): Promise<HealthCheckResult> {
    return (await this.notificationHealthService.checkHealth()) as unknown as HealthCheckResult;
  }

  @Get('notification/metrics')
  @ApiOperation({ summary: 'Get notification metrics' })
  @ApiResponse({ status: 200, description: 'Notification metrics' })
  notificationMetrics(): HealthCheckResult {
    return this.notificationHealthService.getHealthSummary();
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get notifications' })
  @ApiResponse({ status: 200, description: 'Notifications' })
  notifications(): Record<string, ServiceHealthDto> {
    return this.notificationHealthService.getAllServiceHealth();
  }

  @Get('notifications/:serviceName')
  @ApiOperation({ summary: 'Get notification by service name' })
  @ApiResponse({ status: 200, description: 'Notification' })
  notification(@Param('serviceName') serviceName: string): ServiceHealthDto | undefined {
    const service = this.notificationHealthService.getServiceHealth(serviceName);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }
}
