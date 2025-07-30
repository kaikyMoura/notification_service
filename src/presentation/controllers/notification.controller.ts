import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto } from 'src/application/dtos/create-notification.dto';
import { VerificationCodeDto } from 'src/application/dtos/verification-code.dto';
import { VerifyCodeDto } from 'src/application/dtos/verify-code.dto';
import { WelcomeEmailDto } from 'src/application/dtos/welcome-email.dto';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { NotificationTypeEnum } from 'src/domain/enums/notification-type.enum';
import { ResponseType } from 'src/shared/types/response-type';
import { NotificationService } from '../../modules/notification/services/notification.service';

/**
 * @class NotificationController
 * @description Controller for handling notification operations
 */
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Send notification
   * @param dto - Notification data
   * @returns Promise<ResponseType<void>>
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send notification',
    description: 'Send a notification via email or SMS based on the specified channel',
  })
  @ApiBody({
    type: CreateNotificationDto,
    description: 'Notification data including channel, type, and recipient information',
    examples: {
      email: {
        summary: 'Email notification example',
        value: {
          userId: 'user123',
          channel: NotificationChannelEnum.EMAIL,
          type: NotificationTypeEnum.INFO,
          title: 'Important Update',
          message: 'Your account has been updated successfully.',
          email: 'user@example.com',
        },
      },
      sms: {
        summary: 'SMS notification example',
        value: {
          userId: 'user123',
          channel: NotificationChannelEnum.SMS,
          type: NotificationTypeEnum.ALERT,
          title: 'Security Alert',
          message: 'New login detected on your account.',
          phone: '+1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notification sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Notification sent successfully' },
        data: { type: 'object', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid notification data',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Email is required for email notifications' },
        error: { type: 'string', example: 'NOTIFICATION_VALIDATION_FAILED' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Failed to send notification' },
        error: { type: 'string', example: 'PROVIDER_FAILED' },
      },
    },
  })
  async sendNotification(@Body() dto: CreateNotificationDto): Promise<ResponseType<any>> {
    await this.notificationService.send(dto);
    return {
      success: true,
      message: 'Notification sent successfully',
    };
  }

  /**
   * Send welcome email
   * @param dto - Welcome email data
   * @returns Promise<ResponseType<void>>
   */
  @Post('welcome-email')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send welcome email',
    description: 'Send a welcome email to newly registered users',
  })
  @ApiBody({
    type: WelcomeEmailDto,
    description: 'Welcome email data including user information and message',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Welcome email sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Welcome email sent successfully' },
        data: { type: 'object', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid welcome email data',
  })
  async sendWelcomeEmail(@Body() dto: WelcomeEmailDto): Promise<ResponseType<any>> {
    const notificationDto: CreateNotificationDto = {
      userId: dto.userId,
      channel: NotificationChannelEnum.EMAIL,
      type: NotificationTypeEnum.SUCCESS,
      title: dto.title,
      message: dto.message,
      email: dto.email,
    };

    await this.notificationService.sendWelcomeEmail(notificationDto);
    return {
      success: true,
      message: 'Welcome email sent successfully',
    };
  }

  /**
   * Send verification code
   * @param dto - Verification code data
   * @returns Promise<ResponseType<{ status: string; message: string }>>
   */
  @Post('verification-code')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send verification code',
    description: 'Send a verification code via SMS to the specified phone number',
  })
  @ApiBody({
    type: VerificationCodeDto,
    description: 'Phone number for verification code',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Verification code sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Verification code sent successfully' },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Verification code sent to +1234567890' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid phone number',
  })
  async sendVerificationCode(
    @Body() dto: VerificationCodeDto,
  ): Promise<ResponseType<{ status: string; message: string }>> {
    const result = await this.notificationService.sendVerificationCode(dto.phoneNumber);
    return {
      success: true,
      message: 'Verification code sent successfully',
      data: result,
    };
  }

  /**
   * Verify code
   * @param dto - Code verification data
   * @returns Promise<ResponseType<{ success: boolean; message: string }>>
   */
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify code',
    description: 'Verify a previously sent verification code',
  })
  @ApiBody({
    type: VerifyCodeDto,
    description: 'Code and phone number for verification',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Code verification result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Code verified successfully' },
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Verification code verified successfully' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid verification code',
  })
  async verifyCode(@Body() dto: VerifyCodeDto): Promise<ResponseType<{ success: boolean; message: string }>> {
    const result = await this.notificationService.checkVerificationCode(dto.code, dto.phoneNumber);
    return {
      success: true,
      message: 'Code verification completed',
      data: result,
    };
  }
}
