import { IsString, IsEmail, IsBoolean, MaxLength, IsOptional, IsObject } from 'class-validator';

/**
 * @class LoginAttemptDto
 * @description DTO for login attempt event
 * @example
 * {
 *  userId: '123',
 *  email: 'test@example.com',
 *  success: true,
 *  ipAddress: '127.0.0.1',
 *  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
 * }
 */
export class LoginAttemptDto {
  @IsString()
  userId: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  success: boolean;

  @IsString()
  @MaxLength(45)
  ipAddress: string;

  @IsString()
  @MaxLength(500)
  userAgent: string;

  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
