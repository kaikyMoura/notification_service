import { NotificationChannelEnum } from '../enums/notification-chanel.enum';
import { NotificationTypeEnum } from '../enums/notification-type.enum';

/**
 * @interface BusinessEvent
 * @description Base interface for business events
 */
export interface BusinessEvent {
  id: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * @interface UserRegisteredEvent
 * @description Event fired when user registers
 */
export interface UserRegisteredEvent extends BusinessEvent {
  eventType: 'user.registered';
  email: string;
  name: string;
  phone?: string;
  source: string; // 'web', 'mobile', 'api'
}

/**
 * @interface UserVerifiedEvent
 * @description Event fired when user verifies email/phone
 */
export interface UserVerifiedEvent extends BusinessEvent {
  eventType: 'user.verified';
  verificationType: 'email' | 'phone';
  verifiedAt: Date;
}

/**
 * @interface OrderPlacedEvent
 * @description Event fired when order is placed
 */
export interface OrderPlacedEvent extends BusinessEvent {
  eventType: 'order.placed';
  orderId: string;
  amount: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * @interface OrderShippedEvent
 * @description Event fired when order is shipped
 */
export interface OrderShippedEvent extends BusinessEvent {
  eventType: 'order.shipped';
  orderId: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: Date;
}

/**
 * @interface OrderDeliveredEvent
 * @description Event fired when order is delivered
 */
export interface OrderDeliveredEvent extends BusinessEvent {
  eventType: 'order.delivered';
  orderId: string;
  deliveredAt: Date;
  signature?: string;
}

/**
 * @interface PaymentProcessedEvent
 * @description Event fired when payment is processed
 */
export interface PaymentProcessedEvent extends BusinessEvent {
  eventType: 'payment.processed';
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
}

/**
 * @interface PasswordResetRequestedEvent
 * @description Event fired when password reset is requested
 */
export interface PasswordResetRequestedEvent extends BusinessEvent {
  eventType: 'password.reset.requested';
  email: string;
  resetToken: string;
  expiresAt: Date;
}

/**
 * @interface PasswordResetCompletedEvent
 * @description Event fired when password reset is completed
 */
export interface PasswordResetCompletedEvent extends BusinessEvent {
  eventType: 'password.reset.completed';
  email: string;
  resetAt: Date;
}

/**
 * @interface AccountLockedEvent
 * @description Event fired when account is locked
 */
export interface AccountLockedEvent extends BusinessEvent {
  eventType: 'account.locked';
  reason: string;
  lockedAt: Date;
  unlockAt?: Date;
}

/**
 * @interface AccountUnlockedEvent
 * @description Event fired when account is unlocked
 */
export interface AccountUnlockedEvent extends BusinessEvent {
  eventType: 'account.unlocked';
  unlockedAt: Date;
  unlockedBy: string;
}

/**
 * @interface LoginAttemptEvent
 * @description Event fired on login attempt
 */
export interface LoginAttemptEvent extends BusinessEvent {
  eventType: 'login.attempt';
  email: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
  };
}

/**
 * @interface SubscriptionCreatedEvent
 * @description Event fired when subscription is created
 */
export interface SubscriptionCreatedEvent extends BusinessEvent {
  eventType: 'subscription.created';
  subscriptionId: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
}

/**
 * @interface SubscriptionCancelledEvent
 * @description Event fired when subscription is cancelled
 */
export interface SubscriptionCancelledEvent extends BusinessEvent {
  eventType: 'subscription.cancelled';
  subscriptionId: string;
  cancelledAt: Date;
  reason?: string;
  effectiveDate: Date;
}

/**
 * @interface SubscriptionRenewedEvent
 * @description Event fired when subscription is renewed
 */
export interface SubscriptionRenewedEvent extends BusinessEvent {
  eventType: 'subscription.renewed';
  subscriptionId: string;
  renewedAt: Date;
  nextBillingDate: Date;
  amount: number;
  currency: string;
}

/**
 * @type BusinessEventUnion
 * @description Union type of all business events
 */
export type BusinessEventUnion =
  | UserRegisteredEvent
  | UserVerifiedEvent
  | OrderPlacedEvent
  | OrderShippedEvent
  | OrderDeliveredEvent
  | PaymentProcessedEvent
  | PasswordResetRequestedEvent
  | PasswordResetCompletedEvent
  | AccountLockedEvent
  | AccountUnlockedEvent
  | LoginAttemptEvent
  | SubscriptionCreatedEvent
  | SubscriptionCancelledEvent
  | SubscriptionRenewedEvent;

/**
 * @interface NotificationTrigger
 * @description Interface for notification triggers based on business events
 */
export interface NotificationTrigger {
  eventType: string;
  notificationType: NotificationTypeEnum;
  channel: NotificationChannelEnum;
  template: string;
  conditions?: {
    userVerified?: boolean;
    hasPhone?: boolean;
    hasEmail?: boolean;
    [key: string]: any;
  };
  delay?: number; // milliseconds
  priority?: number;
}

/**
 * @constant BUSINESS_EVENT_NOTIFICATIONS
 * @description Mapping of business events to notification triggers
 */
export const BUSINESS_EVENT_NOTIFICATIONS: Record<string, NotificationTrigger[]> = {
  'user.registered': [
    {
      eventType: 'user.registered',
      notificationType: NotificationTypeEnum.SUCCESS,
      channel: NotificationChannelEnum.EMAIL,
      template: 'welcome-email',
      conditions: { hasEmail: true },
      priority: 1,
    },
    {
      eventType: 'user.registered',
      notificationType: NotificationTypeEnum.INFO,
      channel: NotificationChannelEnum.SMS,
      template: 'welcome-sms',
      conditions: { hasPhone: true },
      delay: 5000, // 5 seconds delay
      priority: 2,
    },
  ],
  'user.verified': [
    {
      eventType: 'user.verified',
      notificationType: NotificationTypeEnum.SUCCESS,
      channel: NotificationChannelEnum.EMAIL,
      template: 'verification-success',
      conditions: { userVerified: true },
      priority: 1,
    },
  ],
  'order.placed': [
    {
      eventType: 'order.placed',
      notificationType: NotificationTypeEnum.SUCCESS,
      channel: NotificationChannelEnum.EMAIL,
      template: 'order-confirmation',
      conditions: { hasEmail: true },
      priority: 1,
    },
    {
      eventType: 'order.placed',
      notificationType: NotificationTypeEnum.INFO,
      channel: NotificationChannelEnum.SMS,
      template: 'order-confirmation-sms',
      conditions: { hasPhone: true },
      delay: 2000,
      priority: 2,
    },
  ],
  'order.shipped': [
    {
      eventType: 'order.shipped',
      notificationType: NotificationTypeEnum.INFO,
      channel: NotificationChannelEnum.EMAIL,
      template: 'order-shipped',
      conditions: { hasEmail: true },
      priority: 1,
    },
    {
      eventType: 'order.shipped',
      notificationType: NotificationTypeEnum.INFO,
      channel: NotificationChannelEnum.SMS,
      template: 'order-shipped-sms',
      conditions: { hasPhone: true },
      priority: 2,
    },
  ],
  'order.delivered': [
    {
      eventType: 'order.delivered',
      notificationType: NotificationTypeEnum.SUCCESS,
      channel: NotificationChannelEnum.EMAIL,
      template: 'order-delivered',
      conditions: { hasEmail: true },
      priority: 1,
    },
  ],
  'payment.processed': [
    {
      eventType: 'payment.processed',
      notificationType: NotificationTypeEnum.SUCCESS,
      channel: NotificationChannelEnum.EMAIL,
      template: 'payment-success',
      conditions: { hasEmail: true },
      priority: 1,
    },
  ],
  'password.reset.requested': [
    {
      eventType: 'password.reset.requested',
      notificationType: NotificationTypeEnum.ALERT,
      channel: NotificationChannelEnum.EMAIL,
      template: 'password-reset',
      conditions: { hasEmail: true },
      priority: 1,
    },
  ],
  'account.locked': [
    {
      eventType: 'account.locked',
      notificationType: NotificationTypeEnum.ALERT,
      channel: NotificationChannelEnum.EMAIL,
      template: 'account-locked',
      conditions: { hasEmail: true },
      priority: 1,
    },
    {
      eventType: 'account.locked',
      notificationType: NotificationTypeEnum.ALERT,
      channel: NotificationChannelEnum.SMS,
      template: 'account-locked-sms',
      conditions: { hasPhone: true },
      priority: 2,
    },
  ],
  'login.attempt': [
    {
      eventType: 'login.attempt',
      notificationType: NotificationTypeEnum.ALERT,
      channel: NotificationChannelEnum.EMAIL,
      template: 'login-alert',
      conditions: { hasEmail: true, success: false },
      priority: 1,
    },
  ],
  'subscription.created': [
    {
      eventType: 'subscription.created',
      notificationType: NotificationTypeEnum.SUCCESS,
      channel: NotificationChannelEnum.EMAIL,
      template: 'subscription-welcome',
      conditions: { hasEmail: true },
      priority: 1,
    },
  ],
  'subscription.cancelled': [
    {
      eventType: 'subscription.cancelled',
      notificationType: NotificationTypeEnum.INFO,
      channel: NotificationChannelEnum.EMAIL,
      template: 'subscription-cancelled',
      conditions: { hasEmail: true },
      priority: 1,
    },
  ],
};
