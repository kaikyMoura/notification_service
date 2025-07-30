import { IsString, IsOptional, IsObject } from 'class-validator';

/**
 * @class CustomBusinessEventDto
 * @description DTO for custom business event
 * @example
 * {
 *  eventType: 'user_registered',
 *  userId: '123',
 *  metadata: {
 *    source: 'web'
 *  }
 * }
 */
export class CustomBusinessEventDto {
  @IsString()
  eventType: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
