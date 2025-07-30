import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseType } from 'src/shared/types/response-type';
import { MetricsService } from 'src/infrastructure/metrics/services/metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('notification')
  @ApiOperation({ summary: 'Get notification metrics' })
  @ApiResponse({ status: 200, description: 'Notification metrics' })
  async getNotificationMetrics() {
    return this.metricsService.getNotificationMetrics();
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System metrics' })
  async getSystemMetrics() {
    return this.metricsService.getSystemMetrics();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all metrics' })
  @ApiResponse({ status: 200, description: 'All metrics' })
  async getAllMetrics() {
    return this.metricsService.getAllMetrics();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get metrics summary' })
  @ApiResponse({ status: 200, description: 'Metrics summary' })
  async getMetricsSummary() {
    return this.metricsService.getMetricsSummary();
  }

  @Get('notification/summary')
  @ApiOperation({ summary: 'Get notification metrics summary' })
  @ApiResponse({ status: 200, description: 'Notification metrics summary' })
  async getNotificationMetricsSummary() {
    return this.metricsService.getNotificationMetricsSummary();
  }

  @Get('system/summary')
  @ApiOperation({ summary: 'Get system metrics summary' })
  @ApiResponse({ status: 200, description: 'System metrics summary' })
  async getSystemMetricsSummary() {
    return this.metricsService.getSystemMetricsSummary();
  }

  /**
   * Reset notification metrics
   * @returns Promise<ResponseType<{ reset: boolean }>>
   */
  @Post('metrics/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset notification metrics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Metrics reset successfully',
  })
  resetMetrics(): ResponseType<{ reset: boolean }> {
    try {
      this.metricsService.resetMetrics();

      return {
        success: true,
        message: 'Metrics reset successfully',
        data: { reset: true },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to reset metrics');
    }
  }
}
