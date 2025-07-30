import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { NotificationTypeEnum } from 'src/domain/enums/notification-type.enum';
import {
  NotificationEventUnion,
  NotificationFailedEvent,
  NotificationQueuedEvent,
  NotificationSentEvent,
  VerificationCodeSentEvent,
  VerificationCodeVerifiedEvent,
  WelcomeEmailSentEvent,
} from 'src/domain/interfaces/notification-event.interface';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';

@Injectable()
export class NotificationEventEmitterService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {}

  private emitEvent<T extends NotificationEventUnion>(
    eventType: T['eventType'],
    eventData: Omit<T, 'eventType' | 'timestamp'>,
    logMessage: string,
  ): void {
    const event: T = {
      ...eventData,
      eventType,
      timestamp: new Date(),
    } as T;

    this.logger.log(logMessage);
    this.eventEmitter.emit(eventType, event);
  }

  emitNotificationSent(data: NotificationSentEvent): void {
    this.emitEvent('notification.sent', data, `Emitting notification.sent event for user ${data.userId}`);
  }

  emitNotificationFailed(data: NotificationFailedEvent): void {
    this.emitEvent(
      'notification.failed',
      data,
      `Emitting notification.failed event for user ${data.userId}: ${data.error}`,
    );
  }

  emitNotificationQueued(data: NotificationQueuedEvent): void {
    this.emitEvent(
      'notification.queued',
      data,
      `Emitting notification.queued event for user ${data.userId}, queueId: ${data.queueId}`,
    );
  }

  emitWelcomeEmailSent(data: WelcomeEmailSentEvent): void {
    this.emitEvent(
      'welcome.email.sent',
      {
        ...data,
        channel: NotificationChannelEnum.EMAIL,
        type: NotificationTypeEnum.SUCCESS,
      },
      `Emitting welcome.email.sent event for user ${data.userId}`,
    );
  }

  emitVerificationCodeSent(data: VerificationCodeSentEvent): void {
    this.emitEvent(
      'verification.code.sent',
      {
        ...data,
        phone: data.phoneNumber,
        channel: NotificationChannelEnum.SMS,
        type: NotificationTypeEnum.INFO,
      },
      `Emitting verification.code.sent event for user ${data.userId}`,
    );
  }

  emitVerificationCodeVerified(data: VerificationCodeVerifiedEvent): void {
    this.emitEvent(
      'verification.code.verified',
      {
        ...data,
        phone: data.phoneNumber,
        channel: NotificationChannelEnum.SMS,
        type: NotificationTypeEnum.SUCCESS,
      },
      `Emitting verification.code.verified event for user ${data.userId}`,
    );
  }

  emitCustomEvent(eventType: string, event: NotificationEventUnion): void {
    this.logger.log(`Emitting custom event ${eventType} for user ${event.userId}`);
    this.eventEmitter.emit(eventType, {
      ...event,
      timestamp: new Date(),
      eventType,
    });
  }
}
