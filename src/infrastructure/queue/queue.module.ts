import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationModule } from '../../modules/notification/notification.module';
import { NotificationProcessor } from './processors/notification.processor';
import { QueueService } from './queue.service';

/**
 * Queue module
 * @description This module is responsible for managing the queues.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    forwardRef(() => NotificationModule),
  ],
  providers: [QueueService, NotificationProcessor],
  exports: [QueueService],
})
export class QueueModule {}
