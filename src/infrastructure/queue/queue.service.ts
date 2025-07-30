import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { QueueJob } from 'src/domain/interfaces/queue-job.interface';
import { CreateNotificationDto } from '../../application/dtos/create-notification.dto';
import { NotificationJob } from '../../domain/interfaces/notification-job.interface';
import { ILoggerService } from '../logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from '../logger/logger.constants';

/**
 * Queue service
 * @description This service is responsible for managing the queues.
 */
@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
    @Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}

  /**
   * Add a notification job to the queue
   * @param jobData - The job data
   * @returns The job
   */
  async addNotificationJob(jobData: NotificationJob): Promise<Job> {
    const context = `${this.constructor.name}.addNotificationJob`;
    const { type, userId } = jobData;
    this.logger.log(`Adding notification job for user ${userId}, type: ${type}`, context);

    const priorityMap = {
      low: 3,
      normal: 2,
      high: 1,
    };

    const job = await this.notificationQueue.add('send-notification', jobData, {
      priority: priorityMap[type as keyof typeof priorityMap],
      attempts: 2,
      removeOnComplete: 50,
      removeOnFail: 25,
    });

    this.logger.log(`Notification job added with ID: ${job.id}`, context);

    return job;
  }

  /**
   * Add notification to queue (new method for our notification module)
   * @param type - The notification type
   * @param data - The notification data
   * @returns Promise<string> - Job ID
   */
  async addNotificationToQueue(
    type: 'notification' | 'welcome-email' | 'verification-code',
    data: CreateNotificationDto | { phoneNumber: string } | { code: string; phoneNumber: string },
  ): Promise<string> {
    const context = `${this.constructor.name}.addNotificationToQueue`;

    const jobData = {
      type,
      data,
      timestamp: Date.now(),
    };

    const priorityMap = {
      notification: 2,
      'welcome-email': 2,
      'verification-code': 1, // Higher priority for verification codes
    };

    const job = await this.notificationQueue.add('process-notification', jobData, {
      priority: priorityMap[type],
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    this.logger.log(`Notification job added with ID: ${job.id}, type: ${type}`, context);
    return job.id as string;
  }

  /**
   * Get the status of a specific job
   * @param jobId - The job ID
   * @param queueName - The queue name
   * @returns The job status
   */
  async getJobStatus(jobId: string, queueName: 'notifications'): Promise<any> {
    const queue = queueName === 'notifications' ? this.notificationQueue : this.notificationQueue;

    const job = (await queue.getJob(jobId)) as Job<QueueJob | NotificationJob>;

    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue as QueueJob;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      status: state,
      progress,
      result,
      failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  /**
   * Cancel a specific job
   * @param jobId - The job ID
   * @param queueName - The queue name
   * @returns The job status
   */
  async cancelJob(jobId: string, queueName: 'notifications'): Promise<boolean> {
    const context = `${this.constructor.name}.cancelJob`;
    const queue = queueName === 'notifications' ? this.notificationQueue : this.notificationQueue;

    const job = (await queue.getJob(jobId)) as Job<QueueJob | NotificationJob>;

    if (!job) {
      return false;
    }

    await job.remove();
    this.logger.log(`Job ${jobId} cancelled successfully`, context);

    return true;
  }

  /**
   * Get the statistics of the queues
   * @returns The queue statistics
   */
  async getQueueStats(): Promise<any> {
    const [notificationStats] = await Promise.all([this.notificationQueue.getJobCounts()]);

    return {
      notifications: notificationStats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get notification queue statistics (simplified for our module)
   * @returns Promise<{ pending: number; processing: number; deadLetter: number }>
   */
  async getNotificationQueueStats(): Promise<{ pending: number; processing: number; deadLetter: number }> {
    const stats = await this.notificationQueue.getJobCounts();

    return {
      pending: stats.waiting + stats.delayed,
      processing: stats.active,
      deadLetter: stats.failed,
    };
  }

  /**
   * Clean the completed/failed jobs
   * @param type - The type of jobs to clean
   * @returns void
   */
  async cleanQueues(type?: 'completed' | 'failed'): Promise<void> {
    const queueType = type || 'completed';

    await this.notificationQueue.clean(0, 1000, queueType);

    this.logger.log('Queues cleaned successfully', `${this.constructor.name}.cleanQueues`);
  }
}
