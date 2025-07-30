import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';
import { MemoryMonitorTask } from './tasks/memory-monitor.task';
import { MemoryMonitor } from './utils/memory-monitor';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [MemoryMonitorTask, MemoryMonitor],
  exports: [MemoryMonitorTask, MemoryMonitor],
})
export class SharedModule {}
