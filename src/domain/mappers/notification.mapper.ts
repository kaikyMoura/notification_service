import { Notification as PrismaNotification } from 'prisma/app/generated/prisma/client';
import { NotificationChannelEnum } from '../enums/notification-chanel.enum';
import { NotificationTypeEnum } from '../enums/notification-type.enum';
import { Notification } from '../types/notification';

/**
 * @class NotificationMapper
 * @description Mapper for Notification entity
 */
export class NotificationMapper {
  /**
   * @method toDomain
   * @description Map Notification entity to domain
   * @param notification - Notification entity
   * @returns Notification domain
   */
  static toDomain(notification: PrismaNotification): Notification {
    return new Notification({
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type as NotificationTypeEnum,
      channel: notification.channel as NotificationChannelEnum,
      isRead: notification.isRead,
      readAt: notification.readAt,
      isScheduled: notification.isScheduled,
      scheduledAt: notification.scheduledAt ?? null,
      sentAt: notification.sentAt ?? null,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    });
  }

  /**
   * @method toPrisma
   * @description Map Notification domain to Prisma entity
   * @param notification - Notification domain
   * @returns Prisma entity
   */
  static toPrisma(notification: Notification): PrismaNotification {
    return {
      id: notification.id!,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      channel: notification.channel,
      isRead: notification.isRead,
      readAt: notification.readAt,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      userId: notification.userId,
      isScheduled: notification.isScheduled,
      deletedAt: null,
    };
  }
}
