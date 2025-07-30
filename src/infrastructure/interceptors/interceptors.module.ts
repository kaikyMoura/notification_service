import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { AuditModule } from '../audit/audit.module';
import { LoggerModule } from '../logger/logger.module';
import { MetricsModule } from '../metrics/metrics.module';
import { AuditInterceptor } from './audit.interceptor';
import { CacheInterceptor } from './cache.interceptor';
import { GlobalInterceptor } from './global.interceptor';
import { HttpExceptionInterceptor } from './http-exception.interceptor';
import { LoggerInterceptor } from './logger.interceptor';
import { MemoryMonitorInterceptor } from './memory-monitor.interceptor';
import { MetricsInterceptor } from './metrics.interceptor';
import { PrismaExceptionInterceptor } from './prisma-exception.interceptor';
import { ResponseInterceptor } from './response.interceptor';

@Module({
  imports: [LoggerModule, AuditModule, SharedModule, MetricsModule],
  providers: [
    AuditInterceptor,
    CacheInterceptor,
    GlobalInterceptor,
    HttpExceptionInterceptor,
    LoggerInterceptor,
    MemoryMonitorInterceptor,
    MetricsInterceptor,
    PrismaExceptionInterceptor,
    ResponseInterceptor,
  ],
  exports: [
    AuditInterceptor,
    CacheInterceptor,
    GlobalInterceptor,
    HttpExceptionInterceptor,
    LoggerInterceptor,
    MemoryMonitorInterceptor,
    MetricsInterceptor,
    PrismaExceptionInterceptor,
    ResponseInterceptor,
  ],
})
export class InterceptorsModule {}
