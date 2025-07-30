import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BusinessEventUnion } from 'src/domain/interfaces/business-event.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';

/**
 * @class BusinessEventEmitterService
 * @description Service for emitting business events
 */
@Injectable()
export class BusinessEventEmitterService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}

  /**
   * Emit user registered event
   * @param eventData - Event data
   * @returns Promise<void>
   */
  emitUserRegistered(eventData: {
    userId: string;
    email: string;
    name: string;
    phone?: string;
    source: string;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'user.registered',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting user.registered event for user ${eventData.userId}`);
    this.eventEmitter.emit('user.registered', event);
  }

  /**
   * Emit user verified event
   * @param eventData - Event data
   */
  emitUserVerified(eventData: {
    userId: string;
    verificationType: 'email' | 'phone';
    verifiedAt: Date;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'user.verified',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting user.verified event for user ${eventData.userId}`);
    this.eventEmitter.emit('user.verified', event);
  }

  /**
   * Emit order placed event
   * @param eventData - Event data
   */
  emitOrderPlaced(eventData: {
    userId: string;
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
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'order.placed',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting order.placed event for order ${eventData.orderId}`);
    this.eventEmitter.emit('order.placed', event);
  }

  /**
   * Emit order shipped event
   * @param eventData - Event data
   */
  emitOrderShipped(eventData: {
    userId: string;
    orderId: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: Date;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'order.shipped',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting order.shipped event for order ${eventData.orderId}`);
    this.eventEmitter.emit('order.shipped', event);
  }

  /**
   * Emit order delivered event
   * @param eventData - Event data
   */
  emitOrderDelivered(eventData: {
    userId: string;
    orderId: string;
    deliveredAt: Date;
    signature?: string;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'order.delivered',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting order.delivered event for order ${eventData.orderId}`);
    this.eventEmitter.emit('order.delivered', event);
  }

  /**
   * Emit payment processed event
   * @param eventData - Event data
   */
  emitPaymentProcessed(eventData: {
    userId: string;
    orderId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: 'success' | 'failed' | 'pending';
    transactionId: string;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'payment.processed',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting payment.processed event for transaction ${eventData.transactionId}`);
    this.eventEmitter.emit('payment.processed', event);
  }

  /**
   * Emit password reset requested event
   * @param eventData - Event data
   */
  emitPasswordResetRequested(eventData: {
    userId: string;
    email: string;
    resetToken: string;
    expiresAt: Date;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'password.reset.requested',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting password.reset.requested event for user ${eventData.userId}`);
    this.eventEmitter.emit('password.reset.requested', event);
  }

  /**
   * Emit password reset completed event
   * @param eventData - Event data
   */
  emitPasswordResetCompleted(eventData: {
    userId: string;
    email: string;
    resetAt: Date;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'password.reset.completed',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting password.reset.completed event for user ${eventData.userId}`);
    this.eventEmitter.emit('password.reset.completed', event);
  }

  /**
   * Emit account locked event
   * @param eventData - Event data
   * @returns Promise<void>
   */
  emitAccountLocked(eventData: {
    userId: string;
    reason: string;
    lockedAt: Date;
    unlockAt?: Date;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'account.locked',
      timestamp: new Date(),
    };

    this.logger.warn(`Emitting account.locked event for user ${eventData.userId}: ${eventData.reason}`);
    this.eventEmitter.emit('account.locked', event);
  }

  /**
   * Emit account unlocked event
   * @param eventData - Event data
   */
  emitAccountUnlocked(eventData: {
    userId: string;
    unlockedAt: Date;
    unlockedBy: string;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'account.unlocked',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting account.unlocked event for user ${eventData.userId}`);
    this.eventEmitter.emit('account.unlocked', event);
  }

  /**
   * Emit login attempt event
   * @param eventData - Event data
   * @returns Promise<void>
   */
  emitLoginAttempt(eventData: {
    userId: string;
    email: string;
    success: boolean;
    ipAddress: string;
    userAgent: string;
    location?: {
      country: string;
      city: string;
    };
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'login.attempt',
      timestamp: new Date(),
    };

    const logLevel = eventData.success ? 'log' : 'warn';
    this.logger[logLevel](
      `Emitting login.attempt event for user ${eventData.userId} (${eventData.success ? 'success' : 'failed'})`,
    );
    this.eventEmitter.emit('login.attempt', event);
  }

  /**
   * Emit subscription created event
   * @param eventData - Event data
   */
  emitSubscriptionCreated(eventData: {
    userId: string;
    subscriptionId: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    startDate: Date;
    endDate: Date;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'subscription.created',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting subscription.created event for subscription ${eventData.subscriptionId}`);
    this.eventEmitter.emit('subscription.created', event);
  }

  /**
   * Emit subscription cancelled event
   * @param eventData - Event data
   */
  emitSubscriptionCancelled(eventData: {
    userId: string;
    subscriptionId: string;
    cancelledAt: Date;
    reason?: string;
    effectiveDate: Date;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'subscription.cancelled',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting subscription.cancelled event for subscription ${eventData.subscriptionId}`);
    this.eventEmitter.emit('subscription.cancelled', event);
  }

  /**
   * Emit subscription renewed event
   * @param eventData - Event data
   * @returns Promise<void>
   */
  emitSubscriptionRenewed(eventData: {
    userId: string;
    subscriptionId: string;
    renewedAt: Date;
    nextBillingDate: Date;
    amount: number;
    currency: string;
    metadata?: Record<string, any>;
  }): void {
    const event: BusinessEventUnion = {
      ...eventData,
      id: this.generateEventId(),
      eventType: 'subscription.renewed',
      timestamp: new Date(),
    };

    this.logger.log(`Emitting subscription.renewed event for subscription ${eventData.subscriptionId}`);
    this.eventEmitter.emit('subscription.renewed', event);
  }

  /**
   * Emit custom business event
   * @param eventType - Event type
   * @param eventData - Event data
   */
  emitCustomEvent<T extends BusinessEventUnion>(
    eventType: T['eventType'],
    eventData: Omit<T, 'id' | 'eventType' | 'timestamp'>,
  ): void {
    const event: T = {
      ...eventData,
      id: this.generateEventId(),
      eventType,
      timestamp: new Date(),
    } as T;

    this.logger.log(`Emitting custom business event ${eventType} for user ${eventData.userId}`);
    this.eventEmitter.emit(eventType, event);
  }

  /**
   * Generate unique event ID
   * @returns string
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
