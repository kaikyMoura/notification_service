import { Injectable } from '@nestjs/common';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { NotificationTypeEnum } from 'src/domain/enums/notification-type.enum';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { CreateNotificationDto } from '../dtos/create-notification.dto';

/**
 * @class WelcomeEmailUseCase
 * @description Use case for sending a welcome email
 */
@Injectable()
export class WelcomeEmailUseCase {
  constructor(private readonly notificationService: NotificationService) {}

  async execute(dto: CreateNotificationDto): Promise<void> {
    const emailTemplate = this.getWelcomeEmailTemplate(dto.email || 'User');
    await this.notificationService.send({
      userId: dto.userId,
      email: dto.email,
      title: 'Welcome to our platform',
      message: emailTemplate,
      type: NotificationTypeEnum.SUCCESS,
      channel: NotificationChannelEnum.EMAIL,
    });
  }

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
}
