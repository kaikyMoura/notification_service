import { CreateNotificationDto } from 'src/application/dtos/create-notification.dto';

/**
 * @interface INotifier
 * @description Interface for notifier
 */
export interface INotifier {
  /**
   * @method send
   * @description Send notification
   * @param notification - Notification to send
   * @returns Promise<void>
   */
  send(notification: CreateNotificationDto): Promise<void>;
}
