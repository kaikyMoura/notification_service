import { IsString, MaxLength, IsDateString, IsOptional, IsObject } from 'class-validator';

/**
 * @class OrderShippedDto
 * @description DTO for order shipped event
 * @example
 * {
 *  userId: '123',
 *  orderId: '456',
 *  trackingNumber: '1234567890',
 *  carrier: 'UPS',
 *  estimatedDelivery: '2021-01-01'
 * }
 */
export class OrderShippedDto {
  @IsString()
  userId: string;

  @IsString()
  orderId: string;

  @IsString()
  trackingNumber: string;

  @IsString()
  @MaxLength(100)
  carrier: string;

  @IsDateString()
  estimatedDelivery: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
