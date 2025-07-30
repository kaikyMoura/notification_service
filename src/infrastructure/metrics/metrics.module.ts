import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { NotificationMetricsProvider } from './providers/notification.metrics.provider';
import { SystemMetricsProvider } from './providers/system.metrics.provider';
import { MetricsService } from './services/metrics.service';

/**
 * @module MetricsModule
 * @description Module for metrics
 */
@Module({
  imports: [LoggerModule],
  providers: [NotificationMetricsProvider, SystemMetricsProvider, MetricsService],
  exports: [MetricsService, NotificationMetricsProvider, SystemMetricsProvider],
})
export class MetricsModule {}
