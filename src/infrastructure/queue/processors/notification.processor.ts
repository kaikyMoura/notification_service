import { WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationJob } from 'src/domain/interfaces/notification-job.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { NotificationService } from '../../../modules/notification/services/notification.service';

/**
 * @class NotificationProcessor
 * @description Processor for notification jobs
 */
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {
    super();
  }

  /**
   * Process notification job
   * @param job - The job to process
   */
  async process(job: Job<NotificationJob>): Promise<void> {
    const classContext = `[${this.constructor.name}.process]`;
    const { type, data } = job.data;

    this.logger.log(`Processing notification job ${job.id}: ${type}`, classContext);

    try {
      switch (type) {
        case 'notification':
          await this.notificationService.send(data);
          break;

        case 'welcome-email':
          await this.notificationService.sendWelcomeEmail(data);
          break;

        case 'verification-code':
          await this.notificationService.sendVerificationCode(data.phoneNumber as string);
          break;

        default:
          throw new Error(`Unknown notification type: ${type as string}`);
      }

      this.logger.log(`Notification job ${job.id} processed successfully`, classContext);
    } catch (error) {
      this.logger.error(`Failed to process notification job ${job.id}:`, classContext, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
