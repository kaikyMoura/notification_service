import { Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from 'src/application/dtos/create-notification.dto';
import { AbstractNotifier } from 'src/domain/abstracts/abstract-notifier';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { TwilioProvider } from '../providers/twilio.provider';

@Injectable()
export class TwilioNotifier extends AbstractNotifier {
  constructor(
    private readonly twilioProvider: TwilioProvider,
    @Inject(LOGGER_SERVICE) logger: ILoggerService,
  ) {
    super(logger);
  }

  /**
   * Send the notification
   * @param notification - The notification to send
   * @returns void
   */
  async send(notification: CreateNotificationDto): Promise<void> {
    if (!notification.phone) {
      throw new Error('Phone number is required for SMS notifications');
    }

    this.validateChannel(notification.channel, NotificationChannelEnum.SMS);

    const client = this.twilioProvider.getClient();
    const { TWILIO_PHONE_NUMBER } = this.twilioProvider.getConfig();

    await client.messages.create({
      body: notification.message || '',
      from: TWILIO_PHONE_NUMBER,
      to: notification.phone,
    });

    this.logger.log(`SMS notification sent to: ${notification.phone}`, 'TwilioNotifier.send');
  }

  /**
   * Send verification code (OTP)
   * @param phoneNumber - The phone number to send OTP to
   * @returns Promise<{ status: string; message: string }>
   */
  async sendVerificationCode(phoneNumber: string): Promise<{ status: string; message: string }> {
    const { TWILIO_VERIFY_SERVICE_SID } = this.twilioProvider.getConfig();

    const verification = await this.twilioProvider
      .getClient()
      .verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    return {
      status: verification?.status,
      message: `OTP sent successfully to ${phoneNumber}`,
    };
  }

  /**
   * Check the verification code
   * @param code - The verification code
   * @param phoneNumber - The phone number to verify
   * @returns Promise<{ success: boolean; message: string }>
   */
  async checkVerificationCode(code: string, phoneNumber: string): Promise<{ success: boolean; message: string }> {
    const { TWILIO_VERIFY_SERVICE_SID } = this.twilioProvider.getConfig();

    const verificationCheck = await this.twilioProvider
      .getClient()
      .verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ code, to: phoneNumber });

    if (verificationCheck.status === 'approved') {
      return { success: true, message: 'The code is valid' };
    }

    return { success: false, message: 'Invalid or expired code' };
  }

  /**
   * Validate if string is a valid phone number
   * @param phone - The phone number to validate
   * @returns boolean - True if valid
   */
  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}
