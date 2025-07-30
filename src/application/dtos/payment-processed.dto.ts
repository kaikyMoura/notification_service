import { IsEnum, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * @class PaymentProcessedDto
 * @description DTO for payment processed event
 * @example
 * {
 *  userId: '123',
 *  orderId: '456',
 *  amount: 100,
 *  currency: 'USD',
 *  paymentMethod: 'Credit Card',
 *  status: 'success',
 *  transactionId: '1234567890'
 * }
 */
export class PaymentProcessedDto {
  @IsString()
  userId: string;

  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @MaxLength(10)
  currency: string;

  @IsString()
  @MaxLength(50)
  paymentMethod: string;

  @IsEnum(['success', 'failed', 'pending'])
  status: 'success' | 'failed' | 'pending';

  @IsString()
  transactionId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
