import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from 'src/application/dtos/create-notification.dto';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { NotificationTypeEnum } from 'src/domain/enums/notification-type.enum';
import { NotificationValidationException } from 'src/domain/exceptions/notification.exceptions';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { SendgridNotifier } from '../notifiers/sendigrid.notifier';
import { TwilioNotifier } from '../notifiers/twilio.notifier';
import { NotificationEventEmitterService } from './notification-event-emitter.service';

/**
 * @class NotificationService
 * @description Unified service for handling all notification operations (sync and async)
 */
@Injectable()
export class NotificationService {
  constructor(
    private readonly sendgridNotifier: SendgridNotifier,
    private readonly twilioNotifier: TwilioNotifier,
    private readonly eventEmitter: NotificationEventEmitterService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {}

  /**
   * Send notification (main method)
   * @param dto - The notification data
   * @returns Promise<void>
   */
  async send(dto: CreateNotificationDto): Promise<void> {
    const classContext = `${this.constructor.name}.send`;
    const startTime = Date.now();
    const notificationId = this.generateNotificationId();

    this.logger.log(`Sending notification ${notificationId}`, classContext);
    try {
      this.validateNotificationData(dto);

      this.logger.log(`Validated notification data`, classContext);
      // Emit queued event
      this.eventEmitter.emitNotificationQueued({
        id: notificationId,
        userId: dto.userId,
        channel: dto.channel,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        email: dto.email,
        phone: dto.phone,
        queueId: notificationId,
        priority: 2,
        eventType: 'notification.queued',
        timestamp: new Date(),
      });

      this.logger.log(`Sending notification by channel`, classContext);
      await this.sendByChannel(dto);

      const deliveryTime = Date.now() - startTime;

      this.logger.log(`Notification sent`, classContext);
      // Emit sent event
      this.eventEmitter.emitNotificationSent({
        eventType: 'notification.sent',
        channel: dto.channel,
        type: dto.type,
        timestamp: new Date(),
        id: notificationId,
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        email: dto.email,
        phone: dto.phone,
        provider: this.getProviderName(dto.channel),
        deliveryTime,
      });
    } catch (error) {
      this.logger.error(`Error sending notification ${notificationId}`, classContext);
      // Emit failed event
      this.eventEmitter.emitNotificationFailed({
        eventType: 'notification.failed',
        channel: dto.channel,
        type: dto.type,
        timestamp: new Date(),
        id: notificationId,
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        email: dto.email,
        phone: dto.phone,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        maxRetries: 3,
      });

      throw error;
    }
  }

  /**
   * Send welcome email
   * @param dto - The notification data
   * @returns Promise<void>
   */
  async sendWelcomeEmail(dto: CreateNotificationDto): Promise<void> {
    const classContext = `${this.constructor.name}.sendWelcomeEmail`;
    const notificationId = this.generateNotificationId();

    try {
      this.validateEmailData(dto);

      const emailTemplate = this.getWelcomeEmailTemplate(dto.email || 'User');
      await this.send({
        userId: dto.userId,
        email: dto.email,
        title: 'Welcome to our platform',
        message: emailTemplate,
        type: NotificationTypeEnum.SUCCESS,
        channel: NotificationChannelEnum.EMAIL,
      });

      this.logger.log(`Welcome email sent`, classContext);
      // Emit welcome email sent event
      this.eventEmitter.emitWelcomeEmailSent({
        eventType: 'welcome.email.sent',
        channel: NotificationChannelEnum.EMAIL,
        type: NotificationTypeEnum.ALERT,
        timestamp: new Date(),
        id: notificationId,
        userId: dto.userId,
        email: dto.email!,
        title: 'Welcome to our platform',
        message: emailTemplate,
        template: 'welcome-email',
        provider: 'SendGrid',
      });
    } catch (error) {
      this.logger.error(`Error sending welcome email ${notificationId} to ${dto.email}. Error: ${error}`, classContext);
      // Emit failed event
      this.eventEmitter.emitNotificationFailed({
        id: notificationId,
        userId: dto.userId,
        channel: NotificationChannelEnum.EMAIL,
        type: dto.type,
        title: 'Welcome to our platform',
        message: this.getWelcomeEmailTemplate(dto.email || 'User'),
        email: dto.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        maxRetries: 3,
        eventType: 'notification.failed',
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Send verification code via SMS
   * @param phoneNumber - The phone number
   * @returns Promise<{ status: string; message: string }>
   */
  async sendVerificationCode(phoneNumber: string): Promise<{ status: string; message: string }> {
    const classContext = `${this.constructor.name}.sendVerificationCode`;
    const notificationId = this.generateNotificationId();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.logger.log(`Sending verification code ${notificationId}`, classContext);
    try {
      if (!phoneNumber) {
        this.logger.error(`Phone number is required`, classContext);
        throw new BadRequestException('Phone number is required');
      }

      const result = await this.twilioNotifier.sendVerificationCode(phoneNumber);

      this.logger.log(`Verification code sent`, classContext);
      // Emit verification code sent event
      this.eventEmitter.emitVerificationCodeSent({
        id: notificationId,
        userId: 'system', // For verification codes, we might not have a specific user
        phoneNumber,
        expiresAt,
        provider: 'Twilio',
        eventType: 'verification.code.sent',
        channel: NotificationChannelEnum.EMAIL,
        type: NotificationTypeEnum.ALERT,
        timestamp: new Date(),
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Error sending verification code ${notificationId} to ${phoneNumber}. Error: ${error}`,
        classContext,
      );
      // Emit failed event
      this.eventEmitter.emitNotificationFailed({
        id: notificationId,
        userId: 'system',
        channel: NotificationChannelEnum.SMS,
        type: NotificationTypeEnum.INFO,
        phone: phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        maxRetries: 3,
        eventType: 'notification.failed',
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Check verification code
   * @param code - The verification code
   * @param phoneNumber - The phone number
   * @returns Promise<{ success: boolean; message: string }>
   */
  async checkVerificationCode(code: string, phoneNumber: string): Promise<{ success: boolean; message: string }> {
    const classContext = `${this.constructor.name}.checkVerificationCode`;
    const notificationId = this.generateNotificationId();

    this.logger.log(`Checking verification code ${notificationId}`, classContext);
    try {
      if (!code || !phoneNumber) {
        this.logger.error(`Code and phone number are required`, classContext);
        throw new BadRequestException('Code and phone number are required');
      }

      const result = await this.twilioNotifier.checkVerificationCode(code, phoneNumber);

      this.logger.debug(`Verification code checked`, classContext);
      if (result.success) {
        this.logger.debug(`Verification code verified`, classContext);
        // Emit verification code verified event
        this.eventEmitter.emitVerificationCodeVerified({
          id: notificationId,
          userId: 'system',
          phoneNumber,
          verifiedAt: new Date(),
          eventType: 'verification.code.verified',
          channel: NotificationChannelEnum.EMAIL,
          type: NotificationTypeEnum.ALERT,
          timestamp: new Date(),
        });
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error checking verification code ${notificationId} to ${phoneNumber}. Error: ${error}`,
        classContext,
      );
      // Emit failed event
      this.eventEmitter.emitNotificationFailed({
        id: notificationId,
        userId: 'system',
        channel: NotificationChannelEnum.SMS,
        type: NotificationTypeEnum.INFO,
        phone: phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        maxRetries: 3,
        eventType: 'notification.failed',
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Process notification by channel
   * @param dto - The notification data
   * @returns Promise<void>
   */
  private async sendByChannel(dto: CreateNotificationDto): Promise<void> {
    const classContext = `${this.constructor.name}.sendByChannel`;
    try {
      if (dto.channel === NotificationChannelEnum.EMAIL) {
        this.logger.log(`Sending email notification`, classContext);
        await this.sendgridNotifier.send(dto);
      } else if (dto.channel === NotificationChannelEnum.SMS) {
        this.logger.log(`Sending SMS notification`, classContext);
        await this.twilioNotifier.send(dto);
      } else {
        this.logger.error(`Unsupported channel: ${dto.channel}`, classContext);
        throw new BadRequestException(`Unsupported channel: ${dto.channel}`);
      }
    } catch (error) {
      this.logger.error(`Error sending notification by channel. Error: ${error}`, classContext);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(`Failed to send notification: ${errorMessage}`);
    }
  }

  /**
   * Validate notification data based on channel
   * @param dto - The notification data
   * @returns void
   */
  private validateNotificationData(dto: CreateNotificationDto): void {
    const classContext = `${this.constructor.name}.validateNotificationData`;

    // Validate required fields
    if (!dto.userId?.trim()) {
      this.logger.error(`User ID is required`, classContext);
      throw new NotificationValidationException('userId', 'User ID is required and cannot be empty');
    }

    if (!dto.channel) {
      this.logger.error(`Channel is required`, classContext);
      throw new NotificationValidationException('channel', 'Channel is required');
    }

    // Validate channel-specific requirements
    if (dto.channel === NotificationChannelEnum.EMAIL) {
      if (!dto.email?.trim()) {
        this.logger.error(`Email is required for email notifications`, classContext);
        throw new NotificationValidationException('email', 'Email is required for email notifications');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        this.logger.error(`Invalid email format: ${dto.email}`, classContext);
        throw new NotificationValidationException('email', 'Invalid email format');
      }
    }

    if (dto.channel === NotificationChannelEnum.SMS) {
      if (!dto.phone?.trim()) {
        this.logger.error(`Phone number is required for SMS notifications`, classContext);
        throw new NotificationValidationException('phone', 'Phone number is required for SMS notifications');
      }

      // Basic phone validation (international format)
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(dto.phone.replace(/\s/g, ''))) {
        this.logger.error(`Invalid phone format: ${dto.phone}`, classContext);
        throw new NotificationValidationException('phone', 'Invalid phone number format');
      }
    }

    // Validate content
    if (dto.title && dto.title.length > 200) {
      this.logger.error(`Title too long: ${dto.title.length} characters`, classContext);
      throw new NotificationValidationException('title', 'Title cannot exceed 200 characters');
    }

    if (dto.message && dto.message.length > 1000) {
      this.logger.error(`Message too long: ${dto.message.length} characters`, classContext);
      throw new NotificationValidationException('message', 'Message cannot exceed 1000 characters');
    }
  }

  /**
   * Validate email data for welcome email
   * @param dto - The notification data
   * @returns void
   */
  private validateEmailData(dto: CreateNotificationDto): void {
    const classContext = `${this.constructor.name}.validateEmailData`;
    if (!dto.userId) {
      this.logger.error(`User ID is required`, classContext);
      throw new BadRequestException('User ID is required');
    }
    if (!dto.email) {
      this.logger.error(`Email is required for welcome email`, classContext);
      throw new BadRequestException('Email is required for welcome email');
    }
    if (!dto.title) {
      this.logger.error(`Title is required`, classContext);
      throw new BadRequestException('Title is required');
    }
    if (!dto.message) {
      this.logger.error(`Message is required`, classContext);
      throw new BadRequestException('Message is required');
    }
  }

  /**
   * Get welcome email template
   * @param userEmail - The user email
   * @returns string
   */
  private getWelcomeEmailTemplate(userEmail: string): string {
    return `
      <html>
        <body>
          <h1>Welcome, ${userEmail}!</h1>
          <p>We are very happy to have you with us.</p>
          <p>Your registration was successful and you can now start using our platform.</p>
          <p>If you have any questions, please do not hesitate to contact us.</p>
          <br>
          <p>Best regards,</p>
          <p>Support Team</p>
        </body>
      </html>
    `;
  }

  /**
   * Generate notification ID
   * @returns string
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get provider name based on channel
   * @param channel - The notification channel
   * @returns string
   */
  private getProviderName(channel: NotificationChannelEnum): string {
    switch (channel) {
      case NotificationChannelEnum.EMAIL:
        return 'SendGrid';
      case NotificationChannelEnum.SMS:
        return 'Twilio';
      default:
        return 'Unknown';
    }
  }
}
