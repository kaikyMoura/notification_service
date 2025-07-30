import { NotificationChannelEnum } from '../enums/notification-chanel.enum';
import { NotificationTypeEnum } from '../enums/notification-type.enum';

/**
 * @interface NotificationEvent
 * @description Base interface for notification events
 */
export interface NotificationEvent {
  id: string;
  userId: string;
  channel: NotificationChannelEnum;
  type: NotificationTypeEnum;
  title?: string;
  message?: string;
  email?: string;
  phone?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * @interface NotificationSentEvent
 * @description Event fired when notification is successfully sent
 */
export interface NotificationSentEvent extends NotificationEvent {
  eventType: 'notification.sent';
  provider: string;
  providerMessageId?: string;
  deliveryTime: number; // milliseconds
}

/**
 * @interface NotificationFailedEvent
 * @description Event fired when notification fails to send
 */
export interface NotificationFailedEvent extends NotificationEvent {
  eventType: 'notification.failed';
  error: string;
  retryCount: number;
  maxRetries: number;
}

/**
 * @interface NotificationQueuedEvent
 * @description Event fired when notification is added to queue
 */
export interface NotificationQueuedEvent extends NotificationEvent {
  eventType: 'notification.queued';
  queueId: string;
  priority: number;
}

/**
 * @interface WelcomeEmailSentEvent
 * @description Event fired when welcome email is sent
 */
export interface WelcomeEmailSentEvent extends NotificationEvent {
  eventType: 'welcome.email.sent';
  template: string;
  provider: string;
}

/**
 * @interface VerificationCodeSentEvent
 * @description Event fired when verification code is sent
 */
export interface VerificationCodeSentEvent extends NotificationEvent {
  eventType: 'verification.code.sent';
  phoneNumber: string;
  expiresAt: Date;
  provider: string;
}

/**
 * @interface VerificationCodeVerifiedEvent
 * @description Event fired when verification code is verified
 */
export interface VerificationCodeVerifiedEvent extends NotificationEvent {
  eventType: 'verification.code.verified';
  phoneNumber: string;
  verifiedAt: Date;
}

/**
 * @type NotificationEventUnion
 * @description Union type of all notification events
 */
export type NotificationEventUnion =
  | NotificationSentEvent
  | NotificationFailedEvent
  | NotificationQueuedEvent
  | WelcomeEmailSentEvent
  | VerificationCodeSentEvent
  | VerificationCodeVerifiedEvent;
