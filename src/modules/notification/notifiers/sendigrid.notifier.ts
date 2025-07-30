import { Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from 'src/application/dtos/create-notification.dto';
import { AbstractNotifier } from 'src/domain/abstracts/abstract-notifier';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { ILoggerService } from 'src/infrastructure/logger/interfaces/logger.service.interface';
import { LOGGER_SERVICE } from 'src/infrastructure/logger/logger.constants';
import { SendgridProvider } from '../providers/sengrid.provider';

/**
 * Sendgrid notifier
 * @description Notifier for Sendgrid email
 */
@Injectable()
export class SendgridNotifier extends AbstractNotifier {
  constructor(
    private readonly sendgridProvider: SendgridProvider,
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
    if (!notification.email) {
      throw new Error('Email is required for email notifications');
    }

    this.validateChannel(notification.channel, NotificationChannelEnum.EMAIL);

    const client = this.sendgridProvider.getClient();
    const { SENDGRID_SENDER_EMAIL } = this.sendgridProvider.getConfig();

    const msg = {
      to: notification.email,
      from: SENDGRID_SENDER_EMAIL,
      subject: notification.title || 'Notification',
      html: notification.message || '',
    };

    await client.send(msg);
    this.logger.log(`Email notification sent to: ${notification.email}`, `${this.constructor.name}.send`);
  }
}
