import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * @class WelcomeEmailDto
 * @description DTO for welcome email requests
 */
export class WelcomeEmailDto {
  @IsUUID()
  @IsNotEmpty({ message: 'User ID is required' })
  @ApiProperty({
    description: 'User ID',
    example: 'user123',
    required: true,
  })
  userId: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: true,
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @ApiProperty({
    description: 'Email title',
    example: 'Welcome to our platform!',
    required: true,
  })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @ApiProperty({
    description: 'Email message',
    example: 'Thank you for joining us. We are excited to have you on board!',
    required: true,
  })
  message: string;
}
