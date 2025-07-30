import { IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * @class SubscriptionCreatedDto
 * @description DTO for subscription created event
 * @example
 * {
 *  userId: '123',
 *  subscriptionId: '456',
 *  planId: '789',
 *  planName: 'Pro Plan',
 *  amount: 100,
 *  currency: 'USD',
 *  interval: 'monthly',
 *  startDate: '2021-01-01',
 *  endDate: '2022-01-01',
 *  metadata: {
 *    source: 'web'
 *  }
 * }
 */
export class SubscriptionCreatedDto {
  @IsString()
  userId: string;

  @IsString()
  subscriptionId: string;

  @IsString()
  planId: string;

  @IsString()
  @MaxLength(100)
  planName: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @MaxLength(10)
  currency: string;

  @IsEnum(['monthly', 'yearly'])
  interval: 'monthly' | 'yearly';

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
