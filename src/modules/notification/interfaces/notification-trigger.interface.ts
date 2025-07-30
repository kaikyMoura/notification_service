import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { NotificationTypeEnum } from 'src/domain/enums/notification-type.enum';

/**
 * @interface INotificationTrigger
 * @description Interface for notification trigger
 */
export interface INotificationTrigger {
  eventType: string;
  conditions: any;
  template: string;
  channel: NotificationChannelEnum;
  type: NotificationTypeEnum;
  delay?: number;
}
