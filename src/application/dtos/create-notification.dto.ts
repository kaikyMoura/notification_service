import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationChannelEnum } from 'src/domain/enums/notification-chanel.enum';
import { NotificationTypeEnum } from 'src/domain/enums/notification-type.enum';

/**
 * @class CreateNotificationDto
 * @description DTO for creating a notification
 */
export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty({ message: 'User ID is required' })
  @ApiProperty({
    description: 'The ID of the user to send the notification to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The email of the user to send the notification to',
    example: 'test@example.com',
  })
  email?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The phone number of the user to send the notification to',
    example: '+5511999999999',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The title of the notification',
    example: 'Welcome to our platform',
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The message of the notification',
    example: 'Thank you for joining us',
  })
  message?: string;

  @IsEnum(NotificationChannelEnum)
  @IsNotEmpty({ message: 'Channel is required' })
  @ApiProperty({
    description: 'The channel of the notification',
    example: NotificationChannelEnum.EMAIL,
  })
  channel: NotificationChannelEnum;

  @IsEnum(NotificationTypeEnum)
  @IsNotEmpty({ message: 'Type is required' })
  @ApiProperty({
    description: 'The type of the notification',
    example: NotificationTypeEnum.INFO,
  })
  type: NotificationTypeEnum;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'The metadata of the notification',
    example: { businessEvent: 'user.registered', template: 'welcome', originalEvent: {} },
  })
  metadata?: Record<string, unknown>;
}
