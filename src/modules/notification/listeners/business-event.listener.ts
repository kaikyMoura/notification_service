import { Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from 'src/application/dtos/create-notification.dto';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { BUSINESS_EVENT_NOTIFICATIONS, BusinessEventUnion } from 'src/domain/interfaces/business-event.interface';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { INotificationTrigger } from '../interfaces/notification-trigger.interface';
import { NotificationService } from '../services/notification.service';

/**
 * @class BusinessEventListener
 * @description Listener for business events that automatically triggers notifications
 */
@Injectable()
export class BusinessEventListener {
  constructor(
    private readonly notificationService: NotificationService,
    @Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}

  /**
   * Process business event
   * @param event - The business event
   * @returns Promise<void>
   */
  async processEvent(event: BusinessEventUnion): Promise<void> {
    this.logger.log(`Processing business event: ${event.eventType} for user ${event.userId}`);

    // Get notification triggers for this event type
    const triggers = BUSINESS_EVENT_NOTIFICATIONS[event.eventType] || [];

    if (triggers.length === 0) {
      this.logger.debug(`No notification triggers found for event: ${event.eventType}`);
      return;
    }

    // Process each trigger
    for (const trigger of triggers as unknown as INotificationTrigger[]) {
      try {
        await this.processNotificationTrigger(event, trigger);
      } catch (error) {
        this.logger.error(`Failed to process notification trigger for event ${event.eventType}:`, error);
      }
    }
  }

  /**
   * Process notification trigger
   * @param event - The business event
   * @param trigger - The notification trigger
   * @returns Promise<void>
   */
  private async processNotificationTrigger(event: BusinessEventUnion, trigger: INotificationTrigger): Promise<void> {
    // Check if conditions are met
    if (!this.checkConditions(event, trigger.conditions)) {
      this.logger.debug(`Conditions not met for trigger: ${trigger.template}`);
      return;
    }

    // Create notification DTO
    const notificationDto = this.createNotificationDto(event, trigger);

    // Add delay if specified
    if (trigger.delay) {
      await this.delay(trigger.delay);
    }

    // Send notification
    await this.notificationService.send(notificationDto);

    this.logger.log(`Sent notification for event ${event.eventType} using template: ${trigger.template}`);
  }

  /**
   * Check if conditions are met
   * @param event - The business event
   * @param conditions - The conditions to check
   * @returns boolean
   */
  private checkConditions(event: BusinessEventUnion, conditions?: Record<string, unknown>): boolean {
    if (!conditions) {
      return true;
    }

    // Check for email condition
    if (conditions.hasEmail && !this.hasEmail(event)) {
      return false;
    }

    // Check for phone condition
    if (conditions.hasPhone && !this.hasPhone(event)) {
      return false;
    }

    // Check for user verified condition
    if (conditions.userVerified && !this.isUserVerified(event)) {
      return false;
    }

    // Check for success condition (for login attempts)
    if (conditions.success !== undefined && event.eventType === 'login.attempt') {
      return event.success === conditions.success;
    }

    return true;
  }

  /**
   * Check if event has email
   * @param event - The business event
   * @returns boolean
   */
  private hasEmail(event: BusinessEventUnion): boolean {
    switch (event.eventType) {
      case 'user.registered':
        return !!event.email;
      case 'password.reset.requested':
        return !!event.email;
      case 'login.attempt':
        return !!event.email;
      default:
        return true; // Assume user has email for other events
    }
  }

  /**
   * Check if event has phone
   * @param event - BusinessEventUnion
   * @returns boolean
   */
  private hasPhone(event: BusinessEventUnion): boolean {
    switch (event.eventType) {
      case 'user.registered':
        return !!event.phone;
      default:
        return false; // Most events don't have phone
    }
  }

  /**
   * Check if user is verified
   * @param event - The business event
   * @returns boolean
   */
  private isUserVerified(event: BusinessEventUnion): boolean {
    switch (event.eventType) {
      case 'user.verified':
        return true;
      default:
        return true; // Assume verified for other events
    }
  }

  /**
   * Create notification DTO from business event
   * @param event - The business event
   * @param trigger - The notification trigger
   * @returns CreateNotificationDto
   */
  private createNotificationDto(event: BusinessEventUnion, trigger: INotificationTrigger): CreateNotificationDto {
    const dto: CreateNotificationDto = {
      userId: event.userId,
      channel: trigger.channel,
      type: trigger.type,
      title: this.generateTitle(event),
      message: this.generateMessage(event),
      metadata: {
        businessEvent: event.eventType,
        template: trigger.template,
        originalEvent: event,
      },
    };

    // Add email/phone based on event type
    switch (event.eventType) {
      case 'user.registered':
        if (trigger.channel === NotificationChannelEnum.EMAIL) {
          dto.email = event.email;
        } else if (trigger.channel === NotificationChannelEnum.SMS) {
          dto.phone = event.phone;
        }
        break;
      case 'password.reset.requested':
        if (trigger.channel === NotificationChannelEnum.EMAIL) {
          dto.email = event.email;
        }
        break;
      case 'login.attempt': {
        if (trigger.channel === NotificationChannelEnum.EMAIL) {
          dto.email = event.email;
        }
        break;
      }
    }

    return dto;
  }

  /**
   * Generate notification title
   * @param event - The business event
   * @param trigger - The notification trigger
   * @returns string
   */
  private generateTitle(event: BusinessEventUnion): string {
    switch (event.eventType) {
      case 'user.registered':
        return 'Welcome! 🎉';
      case 'user.verified':
        return 'Account Verified ✅';
      case 'order.placed':
        return 'Order Confirmed 📦';
      case 'order.shipped':
        return 'Order Shipped 🚚';
      case 'order.delivered':
        return 'Order Delivered 📬';
      case 'payment.processed':
        return 'Payment Processed 💳';
      case 'password.reset.requested':
        return 'Password Reset 🔐';
      case 'account.locked':
        return 'Account Locked ⚠️';
      case 'login.attempt':
        return 'Login Attempt 🔒';
      case 'subscription.created':
        return 'Subscription Activated ✨';
      case 'subscription.cancelled':
        return 'Subscription Cancelled 📝';
      default:
        return 'Notification';
    }
  }

  /**
   * Generate notification message
   * @param event - The business event
   * @param trigger - The notification trigger
   * @returns string
   */
  private generateMessage(event: BusinessEventUnion): string {
    switch (event.eventType) {
      case 'user.registered': {
        const userEvent = event;
        return `Hello ${userEvent.name}! Welcome to our platform. Your account has been created successfully.`;
      }

      case 'user.verified':
        return 'Sua conta foi verificada com sucesso! Agora você tem acesso completo a todos os recursos.';

      case 'order.placed': {
        const orderEvent = event;
        return `Your order #${orderEvent.orderId} has been confirmed! Value: ${orderEvent.currency} ${orderEvent.amount.toFixed(2)}`;
      }

      case 'order.shipped': {
        const shippedEvent = event;
        return `Your order #${shippedEvent.orderId} has been shipped! Tracking number: ${shippedEvent.trackingNumber}`;
      }

      case 'order.delivered': {
        const deliveredEvent = event;
        return `Your order #${deliveredEvent.orderId} has been delivered successfully!`;
      }

      case 'payment.processed': {
        const paymentEvent = event;
        return `Payment processed successfully! Value: ${paymentEvent.currency} ${paymentEvent.amount.toFixed(2)}`;
      }

      case 'password.reset.requested': {
        return `You requested a password reset. Check your email to continue.`;
      }

      case 'account.locked': {
        return `Your account has been locked for security reasons. Reason: ${event.reason}`;
      }

      case 'login.attempt':
        {
          if (!event.success) {
            return `Login attempt failed. IP: ${event.ipAddress}. If it was not you, change your password.`;
          }
          return 'Login successful.';
        }
        return 'Login realizado com sucesso.';

      case 'subscription.created': {
        return `Subscription ${event.planName} activated successfully! Value: ${event.currency} ${event.amount.toFixed(2)}/${event.interval}`;
      }

      case 'subscription.cancelled': {
        return `Your subscription has been cancelled. Effective date: ${event.effectiveDate.toLocaleDateString()}`;
      }

      default:
        return 'You received a new notification.';
    }
  }

  /**
   * Delay execution
   * @param ms - Milliseconds to delay
   * @returns Promise<void>
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle processing error
   * @param event - The business event
   * @param error - The error that occurred
   * @returns Promise<void>
   */
  async handleError(event: BusinessEventUnion, error: Error): Promise<void> {
    this.logger.error(
      `Failed to process business event ${event.eventType} for user ${event.userId}: ${error.message}`,
      'BusinessEventListener.handleError',
      {
        stack: error.stack,
      },
    );
  }
}
