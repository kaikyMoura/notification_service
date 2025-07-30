import { NotificationJob } from 'src/domain/interfaces/notification-job.interface';

/**
 * Queue job DTO
 * @description DTO for queue job
 * @implements NotificationJob
 */
export interface QueueJob extends NotificationJob {
  documentId: string;
}
