import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { MemoryMonitor } from 'src/shared/utils/memory-monitor';
import { HealthController } from '../../presentation/controllers/health.controller';
import { HealthService } from './services/health.service';
import { NotificationHealthService } from './services/notification-health.service';

/**
 * @module HealthModule
 * @description Module for health monitoring and checks
 */
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [HealthService, NotificationHealthService, MemoryMonitor, PrismaService],
  controllers: [HealthController],
  exports: [HealthService, NotificationHealthService],
})
export class HealthModule {}
