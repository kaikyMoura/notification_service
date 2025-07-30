import { NotificationChannelEnum } from '../enums/notification-chanel.enum';
import { NotificationTypeEnum } from '../enums/notification-type.enum';

/**
 * @class Notification
 * @description Notification class
 * @property {string} id - Notification id
 * @property {string} userId - User id
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {NotificationTypeEnum} type - Notification type
 * @property {NotificationChannelEnum} channel - Notification channel
 * @property {boolean} isRead - Notification is read
 * @property {Date} readAt - Notification read at
 * @property {boolean} isScheduled - Notification is scheduled
 * @property {Date} scheduledAt - Notification scheduled at
 * @property {Date} sentAt - Notification sent at
 * @property {Date} createdAt - Notification created at
 * @property {Date} updatedAt - Notification updated at
 * @property {Date} deletedAt - Notification deleted at
 * @method isDeleted - Check if notification is deleted
 * @method isSent - Check if notification is sent
 * @method isCreated - Check if notification is created
 * @method isScheduled - Check if notification is scheduled
 * @method isRead - Check if notification is read
 * @method isUpdated - Check if notification is updated
 * @example
 * const notification = new Notification({
 *   id: '1',
 *   userId: '1',
 *   title: 'Notification Title',
 *   message: 'Notification Message',
 * });
 */
export class Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationTypeEnum;
  channel: NotificationChannelEnum;
  isRead: boolean;
  readAt: Date | null;
  isScheduled: boolean;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: Partial<Notification>) {
    Object.assign(this, data);
  }

  isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  isSent(): boolean {
    return this.sentAt !== null && this.sentAt !== undefined;
  }

  isCreated(): boolean {
    return this.createdAt !== null && this.createdAt !== undefined;
  }
}
