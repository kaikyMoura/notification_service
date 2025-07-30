import { IsEmail, IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * @class UserRegisteredDto
 * @description DTO for user registered event
 * @example
 * {
 *  userId: '123',
 *  email: 'test@example.com',
 *  name: 'John Doe',
 *  phone: '1234567890',
 *  source: 'web'
 * }
 */
export class UserRegisteredDto {
  @IsString()
  @MaxLength(100)
  userId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsEnum(['web', 'mobile', 'api'])
  source: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
